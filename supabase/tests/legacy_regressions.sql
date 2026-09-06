-- Reproduce the reported attacks on the old migrations, then roll them back.
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.role = 'authenticated';
SET LOCAL request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
SELECT test.assert((SELECT count(*) = 2 FROM public.contacts), 'legacy customer can read all contacts');
UPDATE public.profiles SET role = 'creator' WHERE id = auth.uid();
SELECT test.assert((SELECT role = 'creator' FROM public.profiles WHERE id = auth.uid()), 'legacy self role escalation reproduced');
INSERT INTO public.project_messages (project_id, sender_id, content)
VALUES ('30000000-0000-0000-0000-000000000002', auth.uid(), 'cross-tenant attack');
INSERT INTO public.project_files (project_id, uploaded_by, file_type, file_url)
VALUES ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'delivery', 'https://example.invalid/forged');
SET LOCAL ROLE anon;
SET LOCAL request.jwt.claim.role = 'anon';
SET LOCAL request.jwt.claim.sub = '';
INSERT INTO public.orders (amount, status) VALUES (1, 'paid');
INSERT INTO public.projects (title, status) VALUES ('Forged', 'DELIVERED');
SELECT test.assert(true, 'legacy anonymous paid order and project creation reproduced');
ROLLBACK;
