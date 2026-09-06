-- Row security on orders/projects cannot hide one column from their customers.
-- Preserve every existing memo in a creator-only relation before dropping the
-- legacy columns. Deploy the updated admin/API code together with this migration.
BEGIN;

-- A mismatched schema already fails at the static INSERT below. Check both
-- sources first to report the missing columns before creating either table.
DO $$
DECLARE missing_columns text;
BEGIN
  SELECT string_agg(required.table_name || '.notes', ', ' ORDER BY required.table_name)
  INTO missing_columns
  FROM (VALUES ('orders'), ('projects')) AS required(table_name)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = required.table_name AND c.column_name = 'notes'
  );
  IF missing_columns IS NOT NULL THEN
    RAISE EXCEPTION 'Internal notes migration requires source columns: %', missing_columns
      USING ERRCODE = '42703', HINT = 'Reconcile the source schema and migration history before retrying.';
  END IF;
END;
$$;

CREATE TABLE public.order_internal_notes (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,
  notes text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.project_internal_notes (
  project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  notes text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.order_internal_notes (order_id, notes, updated_at)
SELECT id, notes, coalesce(updated_at, now()) FROM public.orders WHERE notes IS NOT NULL;
INSERT INTO public.project_internal_notes (project_id, notes, updated_at)
SELECT id, notes, coalesce(updated_at, now()) FROM public.projects WHERE notes IS NOT NULL;

ALTER TABLE public.order_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_internal_notes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_internal_notes, public.project_internal_notes FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.order_internal_notes, public.project_internal_notes TO service_role;
GRANT SELECT, INSERT, DELETE ON public.order_internal_notes, public.project_internal_notes TO authenticated;
-- PostgREST upsert includes the conflict key in its UPDATE list, even when its
-- value is unchanged. Allow that statement while preventing actual reassignment.
GRANT UPDATE (order_id, notes, updated_at) ON public.order_internal_notes TO authenticated;
GRANT UPDATE (project_id, notes, updated_at) ON public.project_internal_notes TO authenticated;

CREATE OR REPLACE FUNCTION app_private.keep_internal_note_parent()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_TABLE_NAME = 'order_internal_notes' THEN
    IF NEW.order_id IS DISTINCT FROM OLD.order_id THEN
      RAISE EXCEPTION 'An internal note cannot be reassigned' USING ERRCODE = '42501';
    END IF;
  ELSIF TG_TABLE_NAME = 'project_internal_notes' THEN
    IF NEW.project_id IS DISTINCT FROM OLD.project_id THEN
      RAISE EXCEPTION 'An internal note cannot be reassigned' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.keep_internal_note_parent() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER keep_internal_note_parent BEFORE UPDATE ON public.order_internal_notes
  FOR EACH ROW EXECUTE FUNCTION app_private.keep_internal_note_parent();
CREATE TRIGGER keep_internal_note_parent BEFORE UPDATE ON public.project_internal_notes
  FOR EACH ROW EXECUTE FUNCTION app_private.keep_internal_note_parent();

CREATE POLICY order_internal_notes_creators ON public.order_internal_notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND app_private.is_tenant_creator(o.tenant_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND app_private.is_tenant_creator(o.tenant_id)));
CREATE POLICY project_internal_notes_creators ON public.project_internal_notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND app_private.is_tenant_creator(p.tenant_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND app_private.is_tenant_creator(p.tenant_id)));

ALTER TABLE public.orders DROP COLUMN notes;
ALTER TABLE public.projects DROP COLUMN notes;

COMMIT;
