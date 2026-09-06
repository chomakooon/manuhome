SET ROLE anon;
SET request.jwt.claim.role = 'anon';
SET request.jwt.claim.sub = '';
SELECT test.reject($sql$SELECT public.reserve_first_order_coupon('20000000-0000-0000-0000-000000000001')$sql$, 'anonymous coupon reservation RPC denied');
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.role = 'authenticated';
SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
SELECT test.reject($sql$SELECT public.reserve_first_order_coupon('20000000-0000-0000-0000-000000000001')$sql$, 'creator cannot directly reserve a coupon');
SELECT test.reject($sql$SELECT * FROM public.first_order_coupon_reservations$sql$, 'coupon reservation emails are not exposed to clients');
RESET ROLE;
SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
SET request.jwt.claim.sub = '';

INSERT INTO public.orders (id, amount, customer_email, form_data) VALUES
 ('50000000-0000-0000-0000-000000000001', 7020, ' First@Example.invalid ', '{"couponCode":"はつもふ10"}'),
 ('50000000-0000-0000-0000-000000000002', 7020, 'first@example.invalid', '{"couponCode":"はつもふ10"}'),
 ('50000000-0000-0000-0000-000000000003', 7020, 'second@example.invalid', '{"couponCode":"はつもふ10"}'),
 ('50000000-0000-0000-0000-000000000004', 7020, 'paid@example.invalid', '{"couponCode":"はつもふ10"}'),
 ('50000000-0000-0000-0000-000000000005', 7020, 'refunded@example.invalid', '{"couponCode":"はつもふ10"}'),
 ('50000000-0000-0000-0000-000000000006', 7800, 'no-coupon@example.invalid', '{}');
INSERT INTO public.orders (amount, customer_email, payment_status) VALUES
 (7800, ' PAID@example.invalid ', 'paid'), (7800, 'Refunded@example.invalid', 'refunded');

SELECT test.assert(public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000001'), 'first introductory coupon reservation succeeds');
SELECT test.assert(public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000001'), 'same order retry keeps its coupon reservation');
SELECT test.assert(NOT public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000002'), 'normalized email cannot reserve coupon for a second order');
SELECT test.assert(public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000003'), 'unrelated email can reserve its own coupon');
SELECT test.assert(NOT public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000004'), 'previous paid order prevents introductory coupon');
SELECT test.assert(NOT public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000005'), 'previous refunded order prevents introductory coupon');
SELECT test.reject($sql$SELECT public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000006')$sql$, 'noncoupon order cannot consume a reservation', '22023');
UPDATE public.first_order_coupon_reservations SET reserved_at = now() - interval '1 year'
WHERE order_id = '50000000-0000-0000-0000-000000000001';
UPDATE public.orders SET payment_status = 'refunded' WHERE id = '50000000-0000-0000-0000-000000000001';
SELECT test.assert(NOT public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000002'), 'old or refunded reservation is never automatically released');
SELECT test.assert(public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000001'), 'original order remains idempotent after refund');

INSERT INTO public.orders (id, tenant_id, amount, customer_email, form_data)
VALUES ('50000000-0000-0000-0000-000000000007', 'bbbbbbbb-0000-0000-0000-000000000000', 7020, 'first@example.invalid', '{"couponCode":"はつもふ10"}');
SELECT test.assert(public.reserve_first_order_coupon('50000000-0000-0000-0000-000000000007'), 'coupon reservation is scoped to its tenant');

INSERT INTO public.orders (id, amount, customer_email, form_data)
SELECT ('60000000-0000-0000-0000-' || lpad(sequence::text, 12, '0'))::uuid, 7020,
  CASE WHEN sequence % 2 = 0 THEN ' CONCURRENT@example.invalid ' ELSE 'concurrent@example.invalid' END,
  '{"couponCode":"はつもふ10"}'::jsonb
FROM generate_series(1, 20) sequence;
RESET ROLE;
SET request.jwt.claim.role = '';
