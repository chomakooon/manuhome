INSERT INTO public.tenants (id, name, slug)
VALUES ('bbbbbbbb-0000-0000-0000-000000000000', 'Other tenant', 'other');
INSERT INTO auth.users (id, raw_user_meta_data) VALUES
 ('10000000-0000-0000-0000-000000000001', '{"full_name":"Customer"}'),
 ('10000000-0000-0000-0000-000000000002', '{"full_name":"Outsider"}'),
 ('10000000-0000-0000-0000-000000000003', '{"role":"creator"}'),
 ('10000000-0000-0000-0000-000000000004', '{"role":"creator","tenant_id":"bbbbbbbb-0000-0000-0000-000000000000"}'),
 ('10000000-0000-0000-0000-000000000005', '{"tenant_id":"bbbbbbbb-0000-0000-0000-000000000000"}');
INSERT INTO public.orders (id, tenant_id, customer_id, amount, stripe_session_id) VALUES
 ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 7800, 'cs_test_primary'),
 ('20000000-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000005', 9900, 'cs_test_other'),
 ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 7800, 'cs_test_duplicate_legacy'),
 ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 4980, 'cs_test_fulfill');
INSERT INTO public.projects (id, tenant_id, order_id, customer_id, title) VALUES
 ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Own project'),
 ('30000000-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Other project'),
 ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Legacy duplicate 1'),
 ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Legacy duplicate 2');
INSERT INTO public.contacts (id, tenant_id, name, email, message) VALUES
 ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Synthetic contact', 'test@example.invalid', 'Synthetic private inquiry'),
 ('40000000-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000000', 'Other contact', 'other@example.invalid', 'Other tenant private inquiry');
UPDATE public.orders SET notes = 'Private legacy order memo' WHERE id = '20000000-0000-0000-0000-000000000001';
UPDATE public.projects SET notes = 'Private legacy project memo' WHERE id = '30000000-0000-0000-0000-000000000001';
-- Exact policy names shipped by the legacy setup script must also be removed.
CREATE POLICY "Allow anonymous users to insert orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to update orders" ON public.orders FOR UPDATE TO authenticated USING (true);
-- A column-level grant survives REVOKE ALL ON TABLE unless explicitly revoked.
GRANT UPDATE (role, tenant_id) ON public.profiles TO authenticated;
