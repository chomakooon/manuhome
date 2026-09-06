BEGIN;

ALTER TABLE public.orders ADD COLUMN checkout_request_id uuid;
ALTER TABLE public.orders ADD COLUMN checkout_request_hash text;
ALTER TABLE public.orders ADD COLUMN currency text NOT NULL DEFAULT 'jpy' CHECK (currency = 'jpy');
ALTER TABLE public.orders ADD COLUMN checkout_url text;
-- The admin workflow and the authoritative payment state must remain separate.
ALTER TABLE public.orders ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded'));
UPDATE public.orders SET payment_status = CASE
  WHEN status = 'refunded' THEN 'refunded'
  WHEN status = 'paid' OR stripe_payment_intent IS NOT NULL THEN 'paid'
  WHEN status = 'failed' THEN 'failed'
  ELSE 'unpaid' END;
CREATE UNIQUE INDEX orders_checkout_request_id_unique ON public.orders (checkout_request_id)
  WHERE checkout_request_id IS NOT NULL;
-- If legacy session IDs conflict, stop for operator review rather than delete or
-- silently reassign historical customer payments.
CREATE UNIQUE INDEX orders_stripe_session_id_unique ON public.orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

INSERT INTO public.products (tenant_id, name, base_price, category, template_id, metadata)
SELECT '00000000-0000-0000-0000-000000000000'::uuid, catalog.name, catalog.price,
  'pet', 'pet-illustration', jsonb_build_object('plan_id', catalog.plan_id)
FROM (VALUES
  ('pet-trial', 'お試しイラスト', 4980),
  ('pet-single', 'Single Item', 7800),
  ('pet-pair', 'Pair Set', 9900)
) AS catalog(plan_id, name, price)
WHERE NOT EXISTS (
  SELECT 1 FROM public.products p
  WHERE p.tenant_id = '00000000-0000-0000-0000-000000000000'::uuid
    AND p.metadata->>'plan_id' = catalog.plan_id
);

CREATE TABLE public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id),
  session_id text NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id),
  processed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.stripe_webhook_events TO service_role;

-- Serializing on the parent order prevents future duplicate projects. Existing
-- duplicates are retained, including their files and messages, for manual review.
CREATE OR REPLACE FUNCTION app_private.prevent_duplicate_order_projects()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.order_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.order_id IS NOT DISTINCT FROM OLD.order_id THEN RETURN NEW; END IF;
  PERFORM 1 FROM public.orders WHERE id = NEW.order_id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM public.projects WHERE order_id = NEW.order_id AND id <> NEW.id) THEN
    RAISE EXCEPTION 'An order already has a project' USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.prevent_duplicate_order_projects() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER prevent_duplicate_order_projects BEFORE INSERT OR UPDATE OF order_id ON public.projects
  FOR EACH ROW EXECUTE FUNCTION app_private.prevent_duplicate_order_projects();

CREATE OR REPLACE FUNCTION public.fulfill_checkout(
  p_event_id text, p_session_id text, p_order_id uuid, p_payment_intent text,
  p_amount integer, p_currency text
)
RETURNS uuid LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  saved_order public.orders%ROWTYPE;
  previous_event public.stripe_webhook_events%ROWTYPE;
  fulfillment_project uuid;
  product_name text;
  attachment_path text;
  attachment_name text;
BEGIN
  IF p_event_id IS NULL OR length(p_event_id) NOT BETWEEN 1 AND 255
     OR p_session_id IS NULL OR length(p_session_id) NOT BETWEEN 1 AND 255
     OR p_payment_intent IS NULL OR length(p_payment_intent) NOT BETWEEN 1 AND 255
     OR p_order_id IS NULL OR p_amount IS NULL OR p_amount < 1 OR p_currency IS DISTINCT FROM 'jpy' THEN
    RAISE EXCEPTION 'Invalid payment event' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO saved_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order was not found'; END IF;
  IF saved_order.stripe_session_id IS DISTINCT FROM p_session_id
     OR saved_order.amount IS DISTINCT FROM p_amount
     OR saved_order.currency IS DISTINCT FROM p_currency
     OR (saved_order.stripe_payment_intent IS NOT NULL
         AND saved_order.stripe_payment_intent <> p_payment_intent) THEN
    RAISE EXCEPTION 'Payment does not match the saved order';
  END IF;

  SELECT * INTO previous_event FROM public.stripe_webhook_events WHERE event_id = p_event_id;
  IF FOUND THEN
    IF previous_event.order_id <> p_order_id OR previous_event.session_id <> p_session_id THEN
      RAISE EXCEPTION 'Payment event was already used for a different order';
    END IF;
    RETURN previous_event.project_id;
  END IF;

  SELECT id INTO fulfillment_project FROM public.projects
  WHERE order_id = saved_order.id ORDER BY created_at, id LIMIT 1;
  IF fulfillment_project IS NULL THEN
    IF saved_order.payment_status = 'refunded' OR saved_order.status = 'refunded' THEN
      RAISE EXCEPTION 'A refunded order cannot create a new project';
    END IF;
    SELECT name INTO product_name FROM public.products WHERE id = saved_order.product_id;
    INSERT INTO public.projects (tenant_id, order_id, customer_id, title, status)
    VALUES (saved_order.tenant_id, saved_order.id, saved_order.customer_id,
            coalesce(product_name, 'ペットイラスト制作'), 'NEW')
    RETURNING id INTO fulfillment_project;
  END IF;

  UPDATE public.orders SET
    payment_status = CASE WHEN payment_status = 'refunded' OR status = 'refunded' THEN 'refunded' ELSE 'paid' END,
    status = CASE WHEN status IN ('pending', 'failed') THEN 'paid' ELSE status END,
    stripe_payment_intent = p_payment_intent,
    updated_at = now()
  WHERE id = saved_order.id;

  FOREACH attachment_path IN ARRAY coalesce(saved_order.asset_urls, ARRAY[]::text[]) LOOP
    IF attachment_path NOT LIKE 'order/' || saved_order.id::text || '/%' THEN
      RAISE EXCEPTION 'Attachment does not belong to the saved order';
    END IF;
    SELECT item->>'name' INTO attachment_name
    FROM jsonb_array_elements(
      coalesce(saved_order.form_data->'photos', '[]'::jsonb)
      || coalesce(saved_order.form_data->'styleReferences', '[]'::jsonb)
    ) AS item
    WHERE item->>'path' = attachment_path LIMIT 1;
    INSERT INTO public.project_files (tenant_id, project_id, file_url, file_name, file_type, uploaded_by)
    SELECT saved_order.tenant_id, fulfillment_project, attachment_path,
      coalesce(attachment_name, regexp_replace(attachment_path, '^.*/', '')), 'asset', saved_order.customer_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.project_files WHERE project_id = fulfillment_project AND file_url = attachment_path
    );
  END LOOP;

  INSERT INTO public.stripe_webhook_events (event_id, order_id, session_id, project_id)
  VALUES (p_event_id, saved_order.id, p_session_id, fulfillment_project)
  ON CONFLICT (event_id) DO NOTHING;
  SELECT * INTO previous_event FROM public.stripe_webhook_events WHERE event_id = p_event_id;
  IF previous_event.order_id <> p_order_id OR previous_event.session_id <> p_session_id THEN
    RAISE EXCEPTION 'Payment event was already used for a different order';
  END IF;
  RETURN fulfillment_project;
END;
$$;
REVOKE ALL ON FUNCTION public.fulfill_checkout(text, text, uuid, text, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_checkout(text, text, uuid, text, integer, text) TO service_role;

COMMIT;
