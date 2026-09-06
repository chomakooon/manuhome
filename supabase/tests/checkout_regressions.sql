SET ROLE service_role;
SET request.jwt.claim.role = 'service_role';
UPDATE public.orders SET
  asset_urls = ARRAY['order/20000000-0000-0000-0000-000000000004/photos/pet.jpg'],
  form_data = '{"photos":[{"path":"order/20000000-0000-0000-0000-000000000004/photos/pet.jpg","name":"My pet.jpg"}]}'
WHERE id = '20000000-0000-0000-0000-000000000004';
SELECT test.reject($sql$SELECT public.fulfill_checkout('evt_wrong_amount','cs_test_fulfill','20000000-0000-0000-0000-000000000004','pi_test_fulfill',1,'jpy')$sql$, 'mismatched payment amount rejected', 'P0001');
SELECT test.reject($sql$SELECT public.fulfill_checkout('evt_wrong_session','cs_other','20000000-0000-0000-0000-000000000004','pi_test_fulfill',4980,'jpy')$sql$, 'mismatched payment session rejected', 'P0001');
SELECT test.reject($sql$SELECT public.fulfill_checkout('evt_wrong_currency','cs_test_fulfill','20000000-0000-0000-0000-000000000004','pi_test_fulfill',4980,'usd')$sql$, 'mismatched currency rejected', '22023');
SELECT test.assert((SELECT count(*) = 0 FROM public.projects WHERE order_id = '20000000-0000-0000-0000-000000000004'), 'invalid payment creates no project');
SELECT test.assert(public.fulfill_checkout('evt_valid','cs_test_fulfill','20000000-0000-0000-0000-000000000004','pi_test_fulfill',4980,'jpy') IS NOT NULL, 'valid payment fulfilled');
SELECT test.assert((SELECT payment_status = 'paid' AND status = 'paid' FROM public.orders WHERE id = '20000000-0000-0000-0000-000000000004'), 'valid payment updates financial state');
SELECT test.assert((SELECT count(*) = 1 FROM public.project_files WHERE file_name = 'My pet.jpg' AND file_type = 'asset'), 'order attachment copied into project with original name');
SELECT test.assert(public.fulfill_checkout('evt_valid','cs_test_fulfill','20000000-0000-0000-0000-000000000004','pi_test_fulfill',4980,'jpy') =
  public.fulfill_checkout('evt_valid_second','cs_test_fulfill','20000000-0000-0000-0000-000000000004','pi_test_fulfill',4980,'jpy'), 'same and distinct duplicate payment events reuse project');
SELECT test.assert((SELECT count(*) = 1 FROM public.projects WHERE order_id = '20000000-0000-0000-0000-000000000004'), 'payment replay creates no duplicate project');
SELECT test.assert((SELECT count(*) = 1 FROM public.project_files WHERE file_name = 'My pet.jpg'), 'payment replay creates no duplicate attachment');
SELECT test.reject($sql$SELECT public.fulfill_checkout('evt_valid','cs_test_other','20000000-0000-0000-0000-000000000002','pi_test_other',9900,'jpy')$sql$, 'same event cannot pay another order', 'P0001');
SELECT test.reject($sql$SELECT public.fulfill_checkout('evt_new_intent','cs_test_fulfill','20000000-0000-0000-0000-000000000004','pi_other',4980,'jpy')$sql$, 'changed payment intent rejected', 'P0001');
UPDATE public.orders SET status = 'done', payment_status = 'refunded'
WHERE id = '20000000-0000-0000-0000-000000000004';
SELECT public.fulfill_checkout('evt_after_refund','cs_test_fulfill','20000000-0000-0000-0000-000000000004','pi_test_fulfill',4980,'jpy');
SELECT test.assert((SELECT status = 'done' AND payment_status = 'refunded' FROM public.orders WHERE id = '20000000-0000-0000-0000-000000000004'), 'late payment replay preserves workflow and refund state');
SELECT public.fulfill_checkout('evt_legacy_duplicate','cs_test_duplicate_legacy','20000000-0000-0000-0000-000000000003','pi_test_legacy',7800,'jpy');
SELECT test.assert((SELECT count(*) = 2 FROM public.projects WHERE order_id = '20000000-0000-0000-0000-000000000003'), 'fulfillment preserves and reuses existing legacy projects');
SELECT test.reject($sql$INSERT INTO public.projects (order_id,title) VALUES ('20000000-0000-0000-0000-000000000003','New duplicate')$sql$, 'future duplicate project insertion rejected', '23505');

INSERT INTO public.orders (id, amount, stripe_session_id, asset_urls)
VALUES ('20000000-0000-0000-0000-000000000006', 7800, 'cs_test_invalid_asset', ARRAY['order/another-order/photos/pet.jpg']);
SELECT test.reject($sql$SELECT public.fulfill_checkout('evt_invalid_asset','cs_test_invalid_asset','20000000-0000-0000-0000-000000000006','pi_test_invalid_asset',7800,'jpy')$sql$, 'invalid saved attachment causes fulfillment rollback', 'P0001');
SELECT test.assert((SELECT payment_status = 'unpaid' FROM public.orders WHERE id = '20000000-0000-0000-0000-000000000006'), 'fulfillment failure rolls back payment state');
SELECT test.assert((SELECT count(*) = 0 FROM public.projects WHERE order_id = '20000000-0000-0000-0000-000000000006'), 'fulfillment failure rolls back new project');
SELECT test.assert((SELECT count(*) = 0 FROM public.stripe_webhook_events WHERE event_id = 'evt_invalid_asset'), 'failed event remains retryable');
UPDATE public.orders SET asset_urls = '{}' WHERE id = '20000000-0000-0000-0000-000000000006';
SELECT test.assert(public.fulfill_checkout('evt_invalid_asset','cs_test_invalid_asset','20000000-0000-0000-0000-000000000006','pi_test_invalid_asset',7800,'jpy') IS NOT NULL, 'repaired order fulfills on event retry');
INSERT INTO public.orders (id, amount, stripe_session_id)
VALUES ('20000000-0000-0000-0000-000000000005', 7800, 'cs_test_parallel');
RESET ROLE;
SET request.jwt.claim.role = '';
