SELECT test.assert((SELECT count(*) = 2 FROM public.projects WHERE order_id = '20000000-0000-0000-0000-000000000003'), 'migration preserves existing duplicate projects');
SELECT test.assert((SELECT notes = 'Private legacy order memo' FROM public.order_internal_notes WHERE order_id = '20000000-0000-0000-0000-000000000001'), 'migration preserves existing order memo');
SELECT test.assert((SELECT notes = 'Private legacy project memo' FROM public.project_internal_notes WHERE project_id = '30000000-0000-0000-0000-000000000001'), 'migration preserves existing project memo');
SELECT test.assert(NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id IN ('project-files', 'submission-files') AND public), 'both attachment buckets are private');
INSERT INTO auth.users (id, raw_user_meta_data)
VALUES ('10000000-0000-0000-0000-000000000006', '{"role":"creator","tenant_id":"not-a-uuid","full_name":"New Customer"}');
SELECT test.assert((SELECT role = 'customer' AND tenant_id = '00000000-0000-0000-0000-000000000000'
  FROM public.profiles WHERE id = '10000000-0000-0000-0000-000000000006'), 'signup ignores privilege-bearing and malformed metadata');

INSERT INTO storage.objects (bucket_id, name) VALUES
 ('project-files', 'projects/30000000-0000-0000-0000-000000000001/asset.jpg'),
 ('project-files', 'projects/30000000-0000-0000-0000-000000000002/secret.jpg'),
 ('submission-files', 'order/20000000-0000-0000-0000-000000000001/photos/pet.jpg'),
 ('submission-files', 'contact/40000000-0000-0000-0000-000000000001/photo.jpg'),
 ('submission-files', 'contact/40000000-0000-0000-0000-000000000002/secret.jpg');

SET ROLE anon;
SET request.jwt.claim.role = 'anon';
SET request.jwt.claim.sub = '';
SELECT test.reject($sql$INSERT INTO public.orders (amount, status) VALUES (1, 'paid')$sql$, 'anonymous paid order insertion rejected');
SELECT test.reject($sql$INSERT INTO public.projects (title, status) VALUES ('Forged', 'DELIVERED')$sql$, 'anonymous project insertion rejected');
SELECT test.reject($sql$INSERT INTO public.contacts (name) VALUES ('Spam')$sql$, 'anonymous direct contact insertion rejected');
SELECT test.reject($sql$SELECT public.consume_rate_limit('a','b',1,1)$sql$, 'anonymous rate-limit RPC denied');
SELECT test.reject($sql$SELECT public.fulfill_checkout('x','y',gen_random_uuid(),'z',1,'jpy')$sql$, 'anonymous fulfillment RPC denied');
SELECT test.assert((SELECT count(*) = 0 FROM storage.objects), 'anonymous storage read blocked despite legacy broad policy');
SELECT test.reject($sql$INSERT INTO storage.objects (bucket_id, name) VALUES ('submission-files','contact/40000000-0000-0000-0000-000000000001/attack.jpg')$sql$, 'anonymous attachment upload rejected');

RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
SELECT test.assert((SELECT count(*) = 0 FROM public.contacts), 'customer cannot read contacts');
SELECT test.assert((SELECT count(*) = 3 FROM public.orders), 'customer reads only own same-tenant orders');
SELECT test.assert((SELECT count(*) = 0 FROM public.order_internal_notes), 'customer cannot read own order internal memo');
SELECT test.assert((SELECT count(*) = 0 FROM public.project_internal_notes), 'customer cannot read own project internal memo');
SELECT test.assert((SELECT NOT (to_jsonb(o) ? 'notes') FROM public.orders o LIMIT 1), 'order record does not expose a legacy notes column');
SELECT test.assert((SELECT NOT (to_jsonb(p) ? 'notes') FROM public.projects p LIMIT 1), 'project record does not expose a legacy notes column');
SELECT test.reject($sql$INSERT INTO public.order_internal_notes (order_id, notes) VALUES ('20000000-0000-0000-0000-000000000004', 'customer attack')$sql$, 'customer cannot insert internal memo');
UPDATE public.profiles SET full_name = 'Updated Customer' WHERE id = auth.uid();
SELECT test.assert((SELECT full_name = 'Updated Customer' FROM public.profiles WHERE id = auth.uid()), 'customer can edit own display name');
SELECT test.reject($sql$UPDATE public.profiles SET role = 'creator' WHERE id = auth.uid()$sql$, 'profile role escalation denied by column grants');
SELECT test.reject($sql$UPDATE public.profiles SET tenant_id = 'bbbbbbbb-0000-0000-0000-000000000000' WHERE id = auth.uid()$sql$, 'profile tenant escalation denied by column grants');
SELECT test.reject($sql$INSERT INTO public.profiles (id, role) VALUES (auth.uid(),'creator') ON CONFLICT (id) DO UPDATE SET role = excluded.role$sql$, 'profile upsert escalation denied');
SELECT test.reject($sql$INSERT INTO public.orders (customer_id,amount,status) VALUES (auth.uid(),1,'paid')$sql$, 'authenticated direct order insertion denied');
SELECT test.reject($sql$SELECT public.consume_rate_limit('a','b',1,1)$sql$, 'customer rate-limit RPC denied');
SELECT test.reject($sql$SELECT public.fulfill_checkout('x','y',gen_random_uuid(),'z',1,'jpy')$sql$, 'customer fulfillment RPC denied');

INSERT INTO public.project_messages (project_id, sender_id, content)
VALUES ('30000000-0000-0000-0000-000000000001', auth.uid(), 'Customer message');
INSERT INTO public.project_files (project_id, uploaded_by, file_type, file_url)
VALUES ('30000000-0000-0000-0000-000000000001', auth.uid(), 'asset', 'projects/30000000-0000-0000-0000-000000000001/new.jpg');
SELECT test.assert((SELECT count(*) = 1 FROM public.project_messages), 'project customer can send and read messages');
SELECT test.reject($sql$INSERT INTO public.project_messages (project_id,sender_id,content) VALUES ('30000000-0000-0000-0000-000000000002',auth.uid(),'attack')$sql$, 'cross-project message insertion rejected');
SELECT test.reject($sql$INSERT INTO public.project_messages (project_id,sender_id,content) VALUES ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','impersonated')$sql$, 'message sender impersonation rejected');
SELECT test.reject($sql$INSERT INTO public.project_messages (tenant_id,project_id,sender_id,content) VALUES ('bbbbbbbb-0000-0000-0000-000000000000','30000000-0000-0000-0000-000000000001',auth.uid(),'wrong tenant')$sql$, 'message tenant mismatch rejected');
SELECT test.reject($sql$INSERT INTO public.project_files (project_id,uploaded_by,file_type,file_url) VALUES ('30000000-0000-0000-0000-000000000001',auth.uid(),'delivery','projects/30000000-0000-0000-0000-000000000001/fake.jpg')$sql$, 'customer cannot register delivery files');
SELECT test.reject($sql$INSERT INTO public.project_files (project_id,uploaded_by,file_type,file_url) VALUES ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','asset','projects/30000000-0000-0000-0000-000000000001/fake.jpg')$sql$, 'file uploader impersonation rejected');
SELECT test.reject($sql$INSERT INTO public.project_files (project_id,uploaded_by,file_type,file_url) VALUES ('30000000-0000-0000-0000-000000000002',auth.uid(),'asset','projects/30000000-0000-0000-0000-000000000002/fake.jpg')$sql$, 'cross-project file insertion rejected');
SELECT test.reject($sql$INSERT INTO public.project_files (project_id,uploaded_by,file_type,file_url) VALUES ('30000000-0000-0000-0000-000000000001',auth.uid(),'asset','https://example.invalid/fake')$sql$, 'external file URL insertion rejected');
SELECT test.assert((SELECT count(*) = 2 FROM storage.objects), 'customer reads own project and order attachments only');
INSERT INTO storage.objects (bucket_id, name)
VALUES ('project-files','projects/30000000-0000-0000-0000-000000000001/customer.jpg');
SELECT test.reject($sql$INSERT INTO storage.objects (bucket_id,name) VALUES ('project-files','projects/30000000-0000-0000-0000-000000000002/attack.jpg')$sql$, 'cross-project storage upload rejected');
SELECT test.reject($sql$INSERT INTO storage.objects (bucket_id,name) VALUES ('submission-files','order/20000000-0000-0000-0000-000000000001/photos/attack.jpg')$sql$, 'client submission upload rejected');
SELECT test.reject($sql$INSERT INTO storage.objects (bucket_id,name) VALUES ('project-files','projects/not-a-uuid/attack.jpg')$sql$, 'malformed storage path rejected safely');
WITH modified AS (UPDATE storage.objects SET name = 'projects/30000000-0000-0000-0000-000000000001/replaced.jpg' RETURNING *)
SELECT test.assert((SELECT count(*) = 0 FROM modified), 'client cannot overwrite existing attachment objects');

SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
SELECT test.assert((SELECT count(*) = 0 FROM public.orders), 'legacy broad order read policy removed');
SELECT test.assert((SELECT count(*) = 0 FROM public.project_messages), 'nonmember cannot read project messages');
SELECT test.assert((SELECT count(*) = 0 FROM public.project_files), 'nonmember cannot read project files');
SELECT test.assert((SELECT count(*) = 0 FROM storage.objects), 'same-tenant nonmember cannot read attachments');
WITH changed AS (UPDATE public.orders SET status = 'done' RETURNING *)
SELECT test.assert((SELECT count(*) = 0 FROM changed), 'legacy broad order update policy removed');

SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
SELECT test.assert((SELECT count(*) = 1 FROM public.contacts), 'creator reads only same-tenant contacts');
SELECT test.assert((SELECT count(*) = 3 FROM public.orders), 'creator reads only same-tenant orders');
UPDATE public.contacts SET status = 'read' WHERE id = '40000000-0000-0000-0000-000000000001';
SELECT test.assert((SELECT status = 'read' FROM public.contacts WHERE id = '40000000-0000-0000-0000-000000000001'), 'creator can update own tenant contact status');
WITH changed AS (UPDATE public.contacts SET status = 'read' WHERE id = '40000000-0000-0000-0000-000000000002' RETURNING *)
SELECT test.assert((SELECT count(*) = 0 FROM changed), 'creator cannot update other tenant contact status');
SELECT test.reject($sql$UPDATE public.contacts SET notification_status = 'sent'$sql$, 'creator cannot forge notification state');
SELECT test.reject($sql$UPDATE public.contacts SET email = 'tampered@example.invalid'$sql$, 'creator cannot alter inquiry identity');
SELECT test.reject($sql$UPDATE public.contacts SET status = 'invalid'$sql$, 'invalid contact status rejected', '23514');
UPDATE public.orders SET status = 'in_progress'
WHERE id = '20000000-0000-0000-0000-000000000001';
INSERT INTO public.order_internal_notes (order_id, notes)
VALUES ('20000000-0000-0000-0000-000000000001', 'Confirmed instructions')
ON CONFLICT (order_id) DO UPDATE SET order_id = excluded.order_id, notes = excluded.notes, updated_at = excluded.updated_at;
SELECT test.assert((SELECT notes = 'Confirmed instructions' FROM public.order_internal_notes WHERE order_id = '20000000-0000-0000-0000-000000000001'), 'creator can upsert and read internal order memo');
INSERT INTO public.order_internal_notes (order_id, notes, updated_at)
VALUES ('20000000-0000-0000-0000-000000000004', 'First memo', now())
ON CONFLICT (order_id) DO UPDATE SET order_id = excluded.order_id, notes = excluded.notes, updated_at = excluded.updated_at;
INSERT INTO public.order_internal_notes (order_id, notes, updated_at)
VALUES ('20000000-0000-0000-0000-000000000004', 'Saved again', now())
ON CONFLICT (order_id) DO UPDATE SET order_id = excluded.order_id, notes = excluded.notes, updated_at = excluded.updated_at;
SELECT test.assert((SELECT notes = 'Saved again' FROM public.order_internal_notes WHERE order_id = '20000000-0000-0000-0000-000000000004'), 'PostgREST-shaped order memo upsert creates and repeatedly updates');
SELECT test.reject($sql$UPDATE public.order_internal_notes SET order_id = '20000000-0000-0000-0000-000000000004' WHERE order_id = '20000000-0000-0000-0000-000000000001'$sql$, 'creator cannot reassign internal order memo');
SELECT test.reject($sql$INSERT INTO public.order_internal_notes (order_id, notes) VALUES ('20000000-0000-0000-0000-000000000002', 'cross-tenant attack')$sql$, 'creator cannot insert other tenant memo');
SELECT test.assert((SELECT status = 'in_progress' AND amount = 7800 FROM public.orders WHERE id = '20000000-0000-0000-0000-000000000001'), 'creator updates workflow without altering amount');
SELECT test.reject($sql$UPDATE public.orders SET amount = 1$sql$, 'creator cannot alter order amount');
SELECT test.reject($sql$UPDATE public.orders SET payment_status = 'paid'$sql$, 'creator cannot alter payment status');
SELECT test.reject($sql$UPDATE public.orders SET customer_id = auth.uid()$sql$, 'creator cannot alter order ownership');
SELECT test.reject($sql$UPDATE public.orders SET status = 'paid'$sql$, 'creator cannot claim payment by workflow status');
SELECT test.reject($sql$UPDATE public.orders SET status = NULL$sql$, 'creator cannot erase workflow state');
UPDATE public.projects SET status = 'IN_PRODUCTION'
WHERE id = '30000000-0000-0000-0000-000000000001';
INSERT INTO public.project_internal_notes (project_id, notes)
VALUES ('30000000-0000-0000-0000-000000000001', 'Creator instructions')
ON CONFLICT (project_id) DO UPDATE SET project_id = excluded.project_id, notes = excluded.notes, updated_at = excluded.updated_at;
SELECT test.assert((SELECT notes = 'Creator instructions' FROM public.project_internal_notes WHERE project_id = '30000000-0000-0000-0000-000000000001'), 'creator can upsert and read internal project memo');
INSERT INTO public.project_internal_notes (project_id, notes, updated_at)
VALUES ('30000000-0000-0000-0000-000000000003', 'First memo', now())
ON CONFLICT (project_id) DO UPDATE SET project_id = excluded.project_id, notes = excluded.notes, updated_at = excluded.updated_at;
INSERT INTO public.project_internal_notes (project_id, notes, updated_at)
VALUES ('30000000-0000-0000-0000-000000000003', 'Saved again', now())
ON CONFLICT (project_id) DO UPDATE SET project_id = excluded.project_id, notes = excluded.notes, updated_at = excluded.updated_at;
SELECT test.assert((SELECT notes = 'Saved again' FROM public.project_internal_notes WHERE project_id = '30000000-0000-0000-0000-000000000003'), 'PostgREST-shaped project memo upsert creates and repeatedly updates');
SELECT test.reject($sql$UPDATE public.project_internal_notes SET project_id = '30000000-0000-0000-0000-000000000003' WHERE project_id = '30000000-0000-0000-0000-000000000001'$sql$, 'creator cannot reassign internal project memo');
SELECT test.reject($sql$UPDATE public.projects SET customer_id = auth.uid()$sql$, 'creator cannot alter project ownership');
INSERT INTO public.project_files (project_id, uploaded_by, file_type, file_url)
VALUES ('30000000-0000-0000-0000-000000000001', auth.uid(), 'delivery', 'projects/30000000-0000-0000-0000-000000000001/delivery.png');
SELECT test.assert((SELECT count(*) = 1 FROM public.project_files WHERE file_type = 'delivery'), 'creator can register delivery for own tenant');
SELECT test.assert((SELECT count(*) = 4 FROM storage.objects), 'creator can read own tenant inquiry and order attachments');

-- Simulate accidental future broad grants: triggers must still protect identity,
-- finance and tenant fields independently of the column permissions.
RESET ROLE;
GRANT UPDATE ON public.profiles, public.orders, public.projects, public.contacts TO authenticated;
SET ROLE authenticated;
SELECT test.reject($sql$UPDATE public.profiles SET role = 'customer' WHERE id = auth.uid()$sql$, 'profile authorization trigger survives broad grant');
SELECT test.reject($sql$UPDATE public.profiles SET tenant_id = 'bbbbbbbb-0000-0000-0000-000000000000' WHERE id = auth.uid()$sql$, 'profile tenant trigger survives broad grant');
SELECT test.reject($sql$UPDATE public.orders SET amount = 1$sql$, 'order finance trigger survives broad grant');
SELECT test.reject($sql$UPDATE public.projects SET customer_id = auth.uid()$sql$, 'project ownership trigger survives broad grant');
SELECT test.reject($sql$UPDATE public.contacts SET notification_status = 'sent'$sql$, 'contact state trigger survives broad grant');
RESET ROLE;
REVOKE UPDATE ON public.profiles, public.orders, public.projects, public.contacts FROM authenticated;
GRANT UPDATE (full_name, company, avatar_url, updated_at) ON public.profiles TO authenticated;
GRANT UPDATE (status, updated_at) ON public.orders TO authenticated;
GRANT UPDATE (title, status, tags, updated_at) ON public.projects TO authenticated;
GRANT UPDATE (status) ON public.contacts TO authenticated;

SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
SET request.jwt.claim.sub = '';
SELECT test.assert(public.consume_rate_limit('contact', 'hashed-ip', 2, 60), 'first rate-limited request accepted');
SELECT test.assert(public.consume_rate_limit('contact', 'hashed-ip', 2, 60), 'request at rate limit accepted');
SELECT test.assert(NOT public.consume_rate_limit('contact', 'hashed-ip', 2, 60), 'request over rate limit rejected');
SELECT test.assert((SELECT requests = 2 FROM public.rate_limit_buckets WHERE scope = 'contact' AND key = 'hashed-ip'), 'denied requests do not grow counters');
UPDATE public.rate_limit_buckets SET expires_at = now() - interval '1 second' WHERE scope = 'contact';
SELECT test.assert(public.consume_rate_limit('contact', 'hashed-ip', 2, 60), 'expired rate window renews');
SELECT test.reject($sql$SELECT public.consume_rate_limit('bad','key',0,60)$sql$, 'invalid rate limit rejected', '22023');
SELECT test.assert(public.consume_rate_limit('ai', 'global', 1, 60), 'global budget first request accepted');
SELECT test.assert(NOT public.consume_rate_limit('ai', 'global', 1, 60), 'global budget exhausted');
INSERT INTO public.contacts (name, notification_status, request_id)
VALUES ('Service submission', 'disabled', '40000000-0000-0000-0000-000000000009');
INSERT INTO storage.objects (bucket_id, name)
VALUES ('submission-files', 'contact/40000000-0000-0000-0000-000000000001/server.jpg');
RESET ROLE;
SET request.jwt.claim.role = '';
