-- Reserve an introductory discount before uploading assets or opening Stripe.
-- A permanent reservation avoids races with late or retried payments. Operators
-- may release one only after verifying that its Stripe session cannot be paid.
BEGIN;

CREATE TABLE public.first_order_coupon_reservations (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  email text NOT NULL CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id),
  reserved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, email)
);
ALTER TABLE public.first_order_coupon_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.first_order_coupon_reservations FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.first_order_coupon_reservations TO service_role;
CREATE INDEX orders_paid_email_lookup ON public.orders (tenant_id, lower(btrim(customer_email)))
  WHERE payment_status IN ('paid', 'refunded');

CREATE OR REPLACE FUNCTION public.reserve_first_order_coupon(p_order_id uuid)
RETURNS boolean LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  saved_order public.orders%ROWTYPE;
  normalized_email text;
  reservation_order uuid;
BEGIN
  SELECT * INTO saved_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order was not found'; END IF;
  normalized_email := lower(btrim(saved_order.customer_email));
  IF saved_order.tenant_id IS NULL OR saved_order.form_data->>'couponCode' IS DISTINCT FROM 'はつもふ10'
     OR normalized_email IS NULL OR length(normalized_email) NOT BETWEEN 3 AND 254 THEN
    RAISE EXCEPTION 'Order is not eligible for a first-order coupon reservation' USING ERRCODE = '22023';
  END IF;

  SELECT order_id INTO reservation_order FROM public.first_order_coupon_reservations
  WHERE tenant_id = saved_order.tenant_id AND email = normalized_email;
  IF FOUND THEN RETURN reservation_order = saved_order.id; END IF;

  IF EXISTS (
    SELECT 1 FROM public.orders
    WHERE tenant_id = saved_order.tenant_id AND lower(btrim(customer_email)) = normalized_email
      AND id <> saved_order.id AND payment_status IN ('paid', 'refunded')
  ) THEN RETURN false; END IF;

  INSERT INTO public.first_order_coupon_reservations (tenant_id, email, order_id)
  VALUES (saved_order.tenant_id, normalized_email, saved_order.id)
  ON CONFLICT (tenant_id, email) DO NOTHING;
  -- The unique constraint serializes competing orders for the same email.
  -- A new statement sees whichever reservation won after a conflict wait.
  SELECT order_id INTO reservation_order FROM public.first_order_coupon_reservations
  WHERE tenant_id = saved_order.tenant_id AND email = normalized_email;
  RETURN reservation_order = saved_order.id;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_first_order_coupon(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_first_order_coupon(uuid) TO service_role;

COMMIT;
