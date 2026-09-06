-- Replace the earlier permissive policies, including policies installed by the
-- legacy setup scripts. Apply with Supabase migrations, never in the browser.
BEGIN;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.is_tenant_creator(target_tenant uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND tenant_id = target_tenant AND role = 'creator'
  );
$$;

CREATE OR REPLACE FUNCTION app_private.belongs_to_tenant(target_tenant uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tenant_id = target_tenant
  );
$$;

CREATE OR REPLACE FUNCTION app_private.is_project_member(target_project uuid, target_tenant uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p JOIN public.profiles me ON me.id = auth.uid()
    WHERE p.id = target_project AND p.tenant_id = target_tenant
      AND me.tenant_id = p.tenant_id AND (p.customer_id = me.id OR me.role = 'creator')
  );
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_private FROM PUBLIC, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_private TO authenticated, service_role;

-- Signup metadata belongs to the user and must never confer authorization.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, tenant_id)
  VALUES (NEW.id, left(NEW.raw_user_meta_data->>'full_name', 200), 'customer',
          '00000000-0000-0000-0000-000000000000'::uuid)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Column grants are the first boundary; triggers also protect these invariants
-- if a future change accidentally restores a broad UPDATE grant.
CREATE OR REPLACE FUNCTION app_private.protect_client_updates()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  editable_columns text[];
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN RETURN NEW; END IF;

  CASE TG_TABLE_NAME
    WHEN 'profiles' THEN editable_columns := ARRAY['full_name', 'company', 'avatar_url', 'updated_at'];
    WHEN 'orders' THEN
      editable_columns := ARRAY['status', 'updated_at'];
      IF NEW.status IS DISTINCT FROM OLD.status
         AND (NEW.status IS NULL OR NEW.status NOT IN ('new', 'quote', 'in_progress', 'revision', 'done')) THEN
        RAISE EXCEPTION 'Payment state is managed by the payment service' USING ERRCODE = '42501';
      END IF;
    WHEN 'projects' THEN editable_columns := ARRAY['title', 'status', 'tags', 'updated_at'];
    WHEN 'contacts' THEN
      editable_columns := ARRAY['status'];
      IF NEW.status IS NULL OR NEW.status NOT IN ('new', 'read', 'replied') THEN
        RAISE EXCEPTION 'Invalid contact status' USING ERRCODE = '23514';
      END IF;
    ELSE RAISE EXCEPTION 'Unexpected protected table';
  END CASE;

  IF (to_jsonb(NEW) - editable_columns) IS DISTINCT FROM (to_jsonb(OLD) - editable_columns) THEN
    RAISE EXCEPTION 'Protected fields cannot be changed by clients' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.protect_client_updates() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE target text; policy_record record; column_list text;
BEGIN
  FOREACH target IN ARRAY ARRAY['profiles', 'orders', 'projects', 'project_files', 'project_messages', 'contacts', 'mailing_list'] LOOP
    FOR policy_record IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = target LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', policy_record.policyname, target);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', target);
    SELECT string_agg(quote_ident(attname), ', ') INTO column_list FROM pg_attribute
    WHERE attrelid = format('public.%I', target)::regclass AND attnum > 0 AND NOT attisdropped;
    EXECUTE format('REVOKE ALL (%s) ON public.%I FROM PUBLIC, anon, authenticated', column_list, target);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', target);
    IF target IN ('profiles', 'orders', 'projects', 'contacts') THEN
      EXECUTE format('CREATE TRIGGER protect_client_updates BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION app_private.protect_client_updates()', target);
    END IF;
  END LOOP;
END;
$$;

GRANT SELECT ON public.profiles, public.orders, public.projects, public.project_files,
  public.project_messages, public.contacts, public.mailing_list TO authenticated;
GRANT UPDATE (full_name, company, avatar_url, updated_at) ON public.profiles TO authenticated;
GRANT UPDATE (status, updated_at) ON public.orders TO authenticated;
GRANT UPDATE (title, status, tags, updated_at) ON public.projects TO authenticated;
GRANT UPDATE (status) ON public.contacts TO authenticated;
GRANT INSERT ON public.project_files, public.project_messages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mailing_list TO authenticated;

CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR app_private.is_tenant_creator(tenant_id));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY orders_read ON public.orders FOR SELECT TO authenticated
  USING (app_private.is_tenant_creator(tenant_id)
    OR (customer_id = auth.uid() AND app_private.belongs_to_tenant(tenant_id)));
CREATE POLICY orders_update ON public.orders FOR UPDATE TO authenticated
  USING (app_private.is_tenant_creator(tenant_id)) WITH CHECK (app_private.is_tenant_creator(tenant_id));

CREATE POLICY projects_read ON public.projects FOR SELECT TO authenticated
  USING (app_private.is_project_member(id, tenant_id));
CREATE POLICY projects_update ON public.projects FOR UPDATE TO authenticated
  USING (app_private.is_tenant_creator(tenant_id)) WITH CHECK (app_private.is_tenant_creator(tenant_id));

CREATE POLICY project_files_read ON public.project_files FOR SELECT TO authenticated
  USING (app_private.is_project_member(project_id, tenant_id));
CREATE POLICY project_files_insert ON public.project_files FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid()
    AND app_private.is_project_member(project_id, tenant_id)
    AND (file_type = 'asset' OR (file_type = 'delivery' AND app_private.is_tenant_creator(tenant_id)))
    AND file_url LIKE 'projects/' || project_id::text || '/%');

CREATE POLICY project_messages_read ON public.project_messages FOR SELECT TO authenticated
  USING (app_private.is_project_member(project_id, tenant_id));
CREATE POLICY project_messages_insert ON public.project_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND app_private.is_project_member(project_id, tenant_id));

CREATE POLICY contacts_read ON public.contacts FOR SELECT TO authenticated
  USING (app_private.is_tenant_creator(tenant_id));
CREATE POLICY contacts_update ON public.contacts FOR UPDATE TO authenticated
  USING (app_private.is_tenant_creator(tenant_id)) WITH CHECK (app_private.is_tenant_creator(tenant_id));

CREATE POLICY mailing_list_manage ON public.mailing_list FOR ALL TO authenticated
  USING (app_private.is_tenant_creator(tenant_id)) WITH CHECK (app_private.is_tenant_creator(tenant_id));

ALTER TABLE public.contacts ADD COLUMN notification_status text NOT NULL DEFAULT 'pending'
  CHECK (notification_status IN ('pending', 'sent', 'disabled', 'failed'));
ALTER TABLE public.contacts ADD COLUMN notified_at timestamptz;
ALTER TABLE public.contacts ADD COLUMN notification_attempts integer NOT NULL DEFAULT 0
  CHECK (notification_attempts >= 0);
ALTER TABLE public.contacts ADD COLUMN request_id uuid;
ALTER TABLE public.contacts ADD COLUMN request_hash text;
CREATE UNIQUE INDEX contacts_request_id_unique ON public.contacts (request_id) WHERE request_id IS NOT NULL;

-- Both attachment buckets require short-lived signed URLs. Submission objects
-- are written by service_role only after server-side validation.
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false), ('submission-files', 'submission-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE OR REPLACE FUNCTION app_private.can_read_attachment(bucket text, object_name text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE kind text := split_part(object_name, '/', 1); target_id uuid;
BEGIN
  IF auth.uid() IS NULL
     OR split_part(object_name, '/', 2) !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
     OR split_part(object_name, '/', 3) = '' THEN RETURN false; END IF;
  target_id := split_part(object_name, '/', 2)::uuid;
  IF bucket = 'project-files' AND kind = 'projects' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.projects p WHERE p.id = target_id
        AND app_private.is_project_member(p.id, p.tenant_id)
    );
  ELSIF bucket = 'submission-files' AND kind = 'order' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.orders o JOIN public.profiles me ON me.id = auth.uid()
      WHERE o.id = target_id AND me.tenant_id = o.tenant_id
        AND (me.role = 'creator' OR me.id = o.customer_id)
    );
  ELSIF bucket = 'submission-files' AND kind = 'contact' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.contacts c WHERE c.id = target_id
        AND app_private.is_tenant_creator(c.tenant_id)
    );
  END IF;
  RETURN false;
END;
$$;
REVOKE ALL ON FUNCTION app_private.can_read_attachment(text, text) FROM PUBLIC, anon;
-- The restrictive policy also evaluates for anon. This function returns false
-- immediately without an authenticated user and exposes no attachment metadata.
GRANT EXECUTE ON FUNCTION app_private.can_read_attachment(text, text) TO anon, authenticated, service_role;

CREATE POLICY manuhome_attachment_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('project-files', 'submission-files') AND app_private.can_read_attachment(bucket_id, name));
CREATE POLICY manuhome_project_upload ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-files' AND app_private.can_read_attachment(bucket_id, name));
-- Restrictive guards also neutralize any pre-existing broadly named storage
-- policies without altering access to unrelated buckets in the same project.
CREATE POLICY manuhome_attachment_read_guard ON storage.objects AS RESTRICTIVE FOR SELECT TO public
  USING (bucket_id NOT IN ('project-files', 'submission-files')
    OR (auth.role() = 'authenticated' AND app_private.can_read_attachment(bucket_id, name)));
CREATE POLICY manuhome_attachment_insert_guard ON storage.objects AS RESTRICTIVE FOR INSERT TO public
  WITH CHECK (bucket_id NOT IN ('project-files', 'submission-files')
    OR (auth.role() = 'authenticated' AND bucket_id = 'project-files' AND app_private.can_read_attachment(bucket_id, name)));
CREATE POLICY manuhome_attachment_update_guard ON storage.objects AS RESTRICTIVE FOR UPDATE TO public
  USING (bucket_id NOT IN ('project-files', 'submission-files'))
  WITH CHECK (bucket_id NOT IN ('project-files', 'submission-files'));
CREATE POLICY manuhome_attachment_delete_guard ON storage.objects AS RESTRICTIVE FOR DELETE TO public
  USING (bucket_id NOT IN ('project-files', 'submission-files'));

CREATE TABLE public.rate_limit_buckets (
  scope text NOT NULL,
  key text NOT NULL,
  requests integer NOT NULL CHECK (requests > 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (scope, key)
);
CREATE INDEX rate_limit_buckets_expiry ON public.rate_limit_buckets (expires_at);
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_buckets FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.rate_limit_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(scope text, key text, max_requests integer, window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE accepted boolean := false; request_time timestamptz := clock_timestamp();
BEGIN
  IF scope IS NULL OR length(scope) NOT BETWEEN 1 AND 100
     OR key IS NULL OR length(key) NOT BETWEEN 1 AND 128
     OR max_requests IS NULL OR max_requests NOT BETWEEN 1 AND 1000000
     OR window_seconds IS NULL OR window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters' USING ERRCODE = '22023';
  END IF;
  DELETE FROM public.rate_limit_buckets WHERE expires_at < request_time - interval '1 day';
  INSERT INTO public.rate_limit_buckets AS bucket (scope, key, requests, expires_at)
  VALUES (scope, key, 1, request_time + make_interval(secs => window_seconds))
  ON CONFLICT ON CONSTRAINT rate_limit_buckets_pkey DO UPDATE SET
    requests = CASE WHEN bucket.expires_at <= request_time THEN 1 ELSE bucket.requests + 1 END,
    expires_at = CASE WHEN bucket.expires_at <= request_time
      THEN request_time + make_interval(secs => window_seconds) ELSE bucket.expires_at END
  WHERE bucket.expires_at <= request_time OR bucket.requests < max_requests
  RETURNING true INTO accepted;
  RETURN coalesce(accepted, false);
END;
$$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer) TO service_role;

COMMIT;
