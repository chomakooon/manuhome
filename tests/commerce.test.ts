import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePrice, TENANT_ID, validateSubmission } from '../supabase/functions/_shared/commerce.ts';
import type { CheckoutSession, CommerceRepository, Order, Product } from '../supabase/functions/_shared/commerce.ts';
import { createCheckoutHandler } from '../supabase/functions/create-checkout/handler.ts';
import type { CheckoutDependencies, CheckoutParameters } from '../supabase/functions/create-checkout/handler.ts';
import { checkoutStatusHandler } from '../supabase/functions/checkout-status/handler.ts';
import { stripeWebhookHandler } from '../supabase/functions/stripe-webhook/handler.ts';
import { pawspressPlans, GIFT_WRAP_OPTION } from '../src/sites/pawspress/data/plans.js';
import { COUPONS, computeDiscount, isCouponApplicable } from '../src/sites/pawspress/data/coupons.js';

Object.assign(globalThis, { Deno: { env: { get: () => undefined } } });
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD2kAAAAASUVORK5CYII=';
const IMAGE = { name: 'pet.png', type: 'image/png', size: Buffer.from(PNG, 'base64').length, dataUrl: `data:image/png;base64,${PNG}` };
const SESSION_ID = 'cs_test_0123456789abcdefghijklmnop';
const PRODUCT_ID = '9dac1980-84d1-48c5-8495-2938ba84b7e2';
function submission() {
    return {
        planId: 'pet-single', goodsTypes: ['Tシャツ', ''], goodsDetails: ['M', ''],
        artStyle: 'character', customStyle: '', giftWrap: false, giftMessage: '',
        customer: { name: '合成テスト', email: 'test@example.invalid', phone: '0312345678', postalCode: '123-4567', address: '合成テスト住所', petName: 'ぽち', petDetail: '耳に白い毛', note: 'テスト注文' },
        couponCode: '', couponAgreed: false, referralCode: '', photoPublishingOptOut: true,
        photos: [IMAGE], styleReferences: [IMAGE],
    };
}
function request(body: unknown, origin = 'https://katachi-lab.creative-own.com') {
    return new Request('https://example.invalid/function', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
}

function fixture() {
    const orders = new Map<string, Order>();
    const calls: { params: CheckoutParameters; key: string }[] = [];
    const events = new Set<string>();
    const projects = new Set<string>();
    const removedPaths: string[] = [];
    const reservations = new Map<string, string>();
    let session: CheckoutSession;
    let paidBefore = false;
    const repository: CommerceRepository = {
        async findByRequest(id) { return structuredClone([...orders.values()].find((order) => order.checkout_request_id === id) ?? null); },
        async findBySession(id) { return structuredClone([...orders.values()].find((order) => order.stripe_session_id === id) ?? null); },
        async findProduct() { return { id: PRODUCT_ID, tenant_id: TENANT_ID, name: 'Single Item', base_price: 7800 } as Product; },
        async reserveFirstOrderCoupon(orderId) {
            const order = orders.get(orderId)!;
            if (reservations.get(order.customer_email) === order.id) return true;
            if (paidBefore || reservations.has(order.customer_email)) return false;
            reservations.set(order.customer_email, order.id);
            return true;
        },
        async insertOrder(order) {
            const existing = [...orders.values()].find((item) => item.checkout_request_id === order.checkout_request_id);
            if (existing) return structuredClone(existing);
            orders.set(order.id, structuredClone(order)); return order;
        },
        async saveAssets(order, photos, references) {
            const existing = orders.get(order.id)!;
            if (existing.options.uploadsReady) return structuredClone(existing);
            const saved = { ...order, form_data: { ...order.form_data, photos, styleReferences: references }, asset_urls: [...photos, ...references].map((file) => file.path), options: { ...order.options, uploadsReady: true } };
            orders.set(order.id, saved); return structuredClone(saved);
        },
        async saveSession(id, sessionId, url) { Object.assign(orders.get(id)!, { stripe_session_id: sessionId, checkout_url: url }); },
        async fulfill(input) {
            events.add(input.p_event_id); projects.add(input.p_order_id);
            Object.assign(orders.get(input.p_order_id)!, { status: 'paid', payment_status: 'paid' });
        },
    };
    const deps: CheckoutDependencies = {
        repository,
        async rateLimit() {},
        async upload(folder, files) { return files.map((file) => ({ path: `${folder}/${crypto.randomUUID()}.png`, name: file.name, type: file.type, size: file.bytes.length })); },
        async cleanup(files) { removedPaths.push(...files.map((file) => file.path)); },
        async createSession(params, key) {
            assert.equal(orders.get(params.metadata.order_id)!.options.uploadsReady, true, 'Photos are durable before payment begins');
            calls.push({ params, key });
            session = { id: SESSION_ID, url: 'https://checkout.stripe.com/c/pay/session', mode: 'payment', status: 'open', payment_status: 'unpaid', currency: 'jpy', amount_total: params.line_items[0].price_data.unit_amount, metadata: params.metadata, payment_intent: 'pi_test_payment' };
            return session;
        },
        async retrieveSession() { return session; },
    };
    return { orders, calls, events, projects, removedPaths, repository, deps, handler: createCheckoutHandler(deps), setPaidBefore: () => { paidBefore = true; }, getSession: () => session, body: { requestId: crypto.randomUUID(), submission: submission() } };
}

test('checkout controls prices and IDs and preserves customer details and private files before Stripe', async () => {
    const f = fixture();
    const response = await f.handler(request({ ...f.body, amount: 1, orderId: PRODUCT_ID, tenantId: 'victim', productId: PRODUCT_ID }));
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.notEqual(result.orderId, PRODUCT_ID);
    assert.notEqual(result.orderId, f.body.requestId);
    assert.equal(f.calls[0].params.line_items[0].price_data.unit_amount, 7800);
    assert.equal(f.calls[0].params.metadata.tenant_id, TENANT_ID);
    assert.deepEqual(Object.keys(f.calls[0].params.metadata).sort(), ['order_id', 'product_id', 'tenant_id']);
    const order = f.orders.get(result.orderId)!;
    assert.deepEqual(order.form_data.customer, f.body.submission.customer);
    assert.equal(order.form_data.photoPublishingOptOut, true);
    assert.equal(order.form_data.photos.length, 1);
    assert.equal(order.form_data.styleReferences.length, 1);
    assert.ok(order.asset_urls.every((path) => path.startsWith(`order/${order.id}/`)));
    assert.equal(JSON.stringify(order).includes(PNG), false);
});

test('server price and coupon rules agree with published plan totals', () => {
    for (const plan of pawspressPlans) {
        for (const coupon of [null, ...COUPONS]) {
            if (coupon && !isCouponApplicable(coupon, plan.id)) continue;
            const raw = { ...submission(), planId: plan.id, goodsTypes: ['Tシャツ', 'マグカップ'], goodsDetails: ['M', ''], giftWrap: true, couponCode: coupon?.code ?? '', couponAgreed: true, photoPublishingOptOut: false };
            const validated = validateSubmission(raw).submission;
            const expected = plan.price + (plan.id === 'pet-trial' ? 0 : GIFT_WRAP_OPTION.price) - computeDiscount(coupon, plan.price, plan.id);
            assert.equal(calculatePrice(validated, plan.price).amount, expected);
        }
    }
});

test('rejects invalid coupon, wrong plan, missing agreement, or conflicting publishing opt-out before checkout', async () => {
    for (const override of [{ couponCode: 'FREE100' }, { couponCode: 'PROMO5500' }, { couponCode: 'PROMO5500', couponAgreed: true, planId: 'pet-trial' }, { couponCode: 'PROMO5500', couponAgreed: true, photoPublishingOptOut: true }]) {
        const f = fixture(); Object.assign(f.body.submission, override);
        assert.equal((await f.handler(request(f.body))).status, 400);
        assert.equal(f.calls.length, 0); assert.equal(f.orders.size, 0);
    }
});

test('first-order coupon rejects a previously paid email', async () => {
    const f = fixture(); f.setPaidBefore(); f.body.submission.couponCode = 'はつもふ10';
    assert.equal((await f.handler(request(f.body))).status, 400); assert.equal(f.calls.length, 0);
});

test('different concurrent requests cannot obtain two first-order coupons for the same normalized email', async () => {
    const f = fixture(); f.body.submission.couponCode = 'はつもふ10';
    const second = structuredClone(f.body); second.requestId = crypto.randomUUID();
    second.submission.customer.email = 'TEST@EXAMPLE.INVALID';
    const responses = await Promise.all([f.handler(request(f.body)), f.handler(request(second))]);
    assert.deepEqual(responses.map((response) => response.status).sort(), [200, 400]);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].params.line_items[0].price_data.unit_amount, 7020);
});

test('first-order coupon retries reuse the existing reservation and independent emails remain eligible', async () => {
    const f = fixture(); f.body.submission.couponCode = 'はつもふ10';
    assert.equal((await f.handler(request(f.body))).status, 200);
    assert.equal((await f.handler(request(f.body))).status, 200);
    assert.equal(f.calls.length, 1);
    const second = structuredClone(f.body); second.requestId = crypto.randomUUID();
    second.submission.customer.email = 'independent@example.invalid';
    assert.equal((await f.handler(request(second))).status, 200);
    assert.equal(f.calls.length, 2);
});

test('coupon reservation failure prevents upload and checkout and is never treated as approval', async () => {
    const f = fixture(); f.body.submission.couponCode = 'はつもふ10';
    let uploads = 0;
    f.deps.upload = async () => { uploads += 1; return []; };
    f.repository.reserveFirstOrderCoupon = async () => { throw new Error('reservation database unavailable'); };
    assert.ok((await f.handler(request(f.body))).status >= 500);
    assert.equal(uploads, 0); assert.equal(f.calls.length, 0);
});

test('retries return one saved checkout but a stolen request ID with different data is rejected', async () => {
    const f = fixture();
    const first = await (await f.handler(request(f.body))).json();
    const second = await (await f.handler(request(f.body))).json();
    assert.deepEqual(second, first); assert.equal(f.calls.length, 1); assert.equal(f.orders.size, 1);
    f.body.submission.customer.email = 'attacker@example.invalid';
    assert.equal((await f.handler(request(f.body))).status, 409);
    assert.equal(f.calls.length, 1);
});

test('reusing an ID with a different photograph is rejected', async () => {
    const f = fixture(); await f.handler(request(f.body));
    f.body.submission.photos = [{ ...IMAGE, name: 'different.png' }];
    assert.equal((await f.handler(request(f.body))).status, 409);
});

test('concurrent identical retries share the server order and exact Stripe idempotency parameters', { timeout: 2000 }, async () => {
    const f = fixture();
    let saving = 0;
    let release: () => void = () => {};
    const bothUploaded = new Promise<void>((resolve) => { release = resolve; });
    const save = f.repository.saveAssets;
    f.repository.saveAssets = async (...args) => {
        saving += 1;
        if (saving === 2) release();
        await bothUploaded;
        return save(...args);
    };
    const responses = await Promise.all([f.handler(request(f.body)), f.handler(request(f.body))]);
    assert.ok(responses.every((response) => response.status === 200));
    assert.equal(f.orders.size, 1);
    assert.ok(f.calls.length >= 1);
    for (const call of f.calls) assert.deepEqual(call, f.calls[0]);
    const acceptedPaths = [...f.orders.values()][0].asset_urls;
    assert.equal(f.removedPaths.length, 2, 'Only the losing concurrent upload set is removed');
    assert.ok(f.removedPaths.every((path) => !acceptedPaths.includes(path)));
});

test('reference upload failure cleans up the same attempt’s photos without creating checkout', async () => {
    const f = fixture();
    const upload = f.deps.upload;
    f.deps.upload = async (folder, files) => {
        if (folder.endsWith('/references')) throw new Error('synthetic reference upload failure');
        return upload(folder, files);
    };
    assert.ok((await f.handler(request(f.body))).status >= 500);
    assert.equal(f.calls.length, 0);
    assert.equal(f.removedPaths.length, 1);
    assert.ok(f.removedPaths[0].includes('/photos/'));
});

test('uncertain asset persistence failure never deletes potentially accepted photos', async () => {
    const f = fixture();
    const save = f.repository.saveAssets;
    f.repository.saveAssets = async (...args) => {
        await save(...args);
        throw new Error('network failed after committing assets');
    };
    assert.ok((await f.handler(request(f.body))).status >= 500);
    assert.equal(f.removedPaths.length, 0);
    const acceptedPaths = [...f.orders.values()][0].asset_urls;
    assert.equal(acceptedPaths.length, 2);
    f.repository.saveAssets = save;
    assert.equal((await f.handler(request(f.body))).status, 200);
    assert.deepEqual([...f.orders.values()][0].asset_urls, acceptedPaths);
});

test('concurrent request ID collision cannot replace the winning order or disclose its checkout', async () => {
    const f = fixture();
    const conflicting = structuredClone(f.body);
    conflicting.submission.customer.email = 'different@example.invalid';
    const responses = await Promise.all([f.handler(request(f.body)), f.handler(request(conflicting))]);
    assert.deepEqual(responses.map((response) => response.status).sort(), [200, 409]);
    assert.equal(f.orders.size, 1); assert.equal(f.calls.length, 1);
    const rejected = responses.find((response) => response.status === 409)!;
    assert.equal('url' in await rejected.json(), false);
});

test('database and upload failures prevent payment creation', async () => {
    for (const stage of ['insert', 'upload', 'saveAssets']) {
        const f = fixture();
        const fail = async () => { throw new Error('synthetic failure'); };
        if (stage === 'insert') f.repository.insertOrder = fail;
        if (stage === 'upload') f.deps.upload = fail;
        if (stage === 'saveAssets') f.repository.saveAssets = fail;
        assert.ok((await f.handler(request(f.body))).status >= 500);
        assert.equal(f.calls.length, 0);
    }
});

test('session association failure is retryable with the same Stripe idempotency key', async () => {
    const f = fixture(); const save = f.repository.saveSession;
    f.repository.saveSession = async () => { throw new Error('synthetic DB failure'); };
    assert.ok((await f.handler(request(f.body))).status >= 500);
    f.repository.saveSession = save;
    assert.equal((await f.handler(request(f.body))).status, 200);
    assert.equal(f.orders.size, 1); assert.equal(f.calls[0].key, f.calls[1].key);
});

test('does not create another payment after Stripe idempotency retention can lapse', async () => {
    const f = fixture(); f.deps.createSession = async () => { throw new Error('network failure'); };
    await f.handler(request(f.body));
    const order = [...f.orders.values()][0]; order.created_at = new Date(Date.now() - 25 * 3600000).toISOString();
    assert.equal((await f.handler(request(f.body))).status, 409);
});

test('rejects untrusted origins and spoofed image content', async () => {
    const f = fixture();
    assert.equal((await f.handler(request(f.body, 'https://attacker.invalid'))).status, 403);
    f.body.submission.photos = [{ name: 'pet.png', type: 'image/png', size: 6, dataUrl: 'data:image/png;base64,PHN2Zz4K' }];
    assert.equal((await f.handler(request(f.body))).status, 400); assert.equal(f.calls.length, 0);
});

test('status checks real Stripe and DB agreement and returns only payment/fulfillment state', async () => {
    const f = fixture(); await f.handler(request(f.body));
    const handler = checkoutStatusHandler(f.deps);
    const body = { sessionId: SESSION_ID, stripe: 'success', paid: true };
    assert.deepEqual(await (await handler(request(body))).json(), { paymentStatus: 'unpaid', orderStatus: 'pending' });
    f.getSession().payment_status = 'paid';
    assert.deepEqual(await (await handler(request(body))).json(), { paymentStatus: 'paid', orderStatus: 'processing' });
    [...f.orders.values()][0].payment_status = 'paid';
    assert.deepEqual(await (await handler(request(body))).json(), { paymentStatus: 'paid', orderStatus: 'confirmed' });
    f.getSession().amount_total = 1;
    assert.equal((await handler(request(body))).status, 409);
    assert.equal((await handler(request({ sessionId: 'cs_test_missing01234567890' }))).status, 404);
});

test('status reports a saved refund even though Stripe Checkout remains paid', async () => {
    const f = fixture(); await f.handler(request(f.body));
    f.getSession().payment_status = 'paid';
    [...f.orders.values()][0].payment_status = 'refunded';
    const handler = checkoutStatusHandler(f.deps);
    const response = await handler(request({ sessionId: SESSION_ID }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { paymentStatus: 'refunded', orderStatus: 'pending' });
});

test('webhook requires signature and confirms persistence before acknowledging settlement', async () => {
    const f = fixture(); await f.handler(request(f.body));
    const session = f.getSession(); session.payment_status = 'paid';
    const handler = stripeWebhookHandler({ repository: f.repository, async verifyEvent(_body, signature) {
        if (signature !== 'valid') throw new Error('bad signature');
        return { id: 'evt_test1', type: 'checkout.session.completed', data: { object: session } };
    } });
    const req = (signature = 'valid') => new Request('https://example.invalid/webhook', { method: 'POST', headers: { 'stripe-signature': signature }, body: '{}' });
    assert.equal((await handler(req('invalid'))).status, 400);
    assert.equal((await handler(req())).status, 200);
    assert.equal((await handler(req())).status, 200);
    assert.equal(f.projects.size, 1); assert.equal(f.events.size, 1);
    f.repository.fulfill = async () => { throw new Error('synthetic DB failure'); };
    assert.equal((await handler(req())).status, 503);
});

test('webhook rejects mismatched totals and unpaid sessions never create a project', async () => {
    const f = fixture(); await f.handler(request(f.body));
    const session = f.getSession();
    const handler = stripeWebhookHandler({ repository: f.repository, async verifyEvent() {
        return { id: 'evt_test2', type: 'checkout.session.completed', data: { object: session } };
    } });
    const req = () => new Request('https://example.invalid/webhook', { method: 'POST', headers: { 'stripe-signature': 'valid' }, body: '{}' });
    assert.equal((await handler(req())).status, 200); assert.equal(f.projects.size, 0);
    session.payment_status = 'paid'; session.amount_total = 1;
    assert.equal((await handler(req())).status, 503); assert.equal(f.projects.size, 0);
});
