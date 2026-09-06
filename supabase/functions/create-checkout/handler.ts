import { corsResponse, HttpError, jsonResponse, readJson, requestOrigin, respondError } from '../_shared/http.ts';
import { assertMatchingSession, calculatePrice, submissionFingerprint, TENANT_ID, UUID, validateSubmission } from '../_shared/commerce.ts';
import type { CheckoutSession, CommerceRepository, Order, SavedUpload, Upload } from '../_shared/commerce.ts';

export type CheckoutParameters = {
    mode: 'payment';
    payment_method_types: ['card'];
    line_items: [{ price_data: { currency: 'jpy'; product_data: { name: string }; unit_amount: number }; quantity: 1 }];
    customer_email: string;
    success_url: string;
    cancel_url: string;
    metadata: Record<string, string>;
    payment_intent_data: { metadata: Record<string, string> };
};

export type CheckoutDependencies = {
    repository: CommerceRepository;
    rateLimit(req: Request): Promise<void>;
    upload(folder: string, files: Upload[]): Promise<SavedUpload[]>;
    cleanup(files: SavedUpload[]): Promise<void>;
    createSession(params: CheckoutParameters, idempotencyKey: string): Promise<CheckoutSession>;
    retrieveSession(id: string): Promise<CheckoutSession>;
};

function requireSameRequest(order: Order, fingerprint: string): void {
    // A request ID alone is never sufficient to retrieve somebody else's checkout.
    if (order.checkout_request_hash !== fingerprint) throw new HttpError(409, '注文内容が変更されています。ページを再読み込みしてお申し込みください。');
}

async function existingCheckout(order: Order, deps: CheckoutDependencies): Promise<string> {
    const session = await deps.retrieveSession(order.stripe_session_id!);
    assertMatchingSession(order, session);
    if (session.status !== 'open' || session.payment_status !== 'unpaid' || !session.url) {
        throw new HttpError(409, 'この決済は完了または有効期限切れです。注文状況をご確認ください。');
    }
    return session.url;
}

export function createCheckoutHandler(deps: CheckoutDependencies) {
    return async (req: Request): Promise<Response> => {
        try {
            const preflight = corsResponse(req);
            if (preflight) return preflight;
            if (req.method !== 'POST') throw new HttpError(405, 'POSTで送信してください。');
            await deps.rateLimit(req);
            const body = await readJson(req, 29 * 1024 * 1024) as Record<string, unknown>;
            if (!body || typeof body !== 'object' || typeof body.requestId !== 'string' || !UUID.test(body.requestId)) {
                throw new HttpError(400, '注文リクエストをご確認ください。');
            }
            const { submission, photos, references } = validateSubmission(body.submission);
            const fingerprint = await submissionFingerprint(submission, photos, references);
            let order = await deps.repository.findByRequest(body.requestId);
            if (order) requireSameRequest(order, fingerprint);
            if (!order) {
                const product = await deps.repository.findProduct(submission.planId);
                const price = calculatePrice(submission, product.base_price);
                order = await deps.repository.insertOrder({
                    id: crypto.randomUUID(), tenant_id: TENANT_ID, product_id: product.id,
                    customer_id: null, customer_email: submission.customer.email,
                    amount: price.amount, currency: 'jpy', status: 'pending', payment_status: 'unpaid',
                    checkout_request_id: body.requestId, checkout_request_hash: fingerprint,
                    stripe_session_id: null, checkout_url: null, created_at: new Date().toISOString(),
                    form_data: { ...submission, photos: [], styleReferences: [] },
                    options: { source: 'stripe_checkout', productName: product.name, returnOrigin: requestOrigin(req), discountAmount: price.discountAmount, uploadsReady: false },
                    asset_urls: [], tier_id: submission.planId,
                    selected_options: submission.giftWrap ? ['gift-wrap'] : [],
                });
                requireSameRequest(order, fingerprint);
            }
            if (order.form_data.couponCode === 'はつもふ10' && !await deps.repository.reserveFirstOrderCoupon(order.id)) {
                throw new HttpError(400, 'このメールアドレスでは初回クーポンを使用した注文が既にあります。作成済みの注文を再試行するか、お問い合わせください。');
            }
            if (order.stripe_session_id) return jsonResponse(req, { url: await existingCheckout(order, deps), orderId: order.id });
            // Stripe may forget an idempotency key after 24h. Never recreate an uncertain old payment.
            if (Date.now() - Date.parse(order.created_at) > 23 * 60 * 60 * 1000) {
                throw new HttpError(409, '注文の有効期限が切れました。ページを再読み込みしてお申し込みください。');
            }
            if (!order.options.uploadsReady) {
                const savedPhotos = await deps.upload(`order/${order.id}/photos`, photos);
                let savedReferences: SavedUpload[];
                try {
                    savedReferences = await deps.upload(`order/${order.id}/references`, references);
                } catch (error) {
                    await deps.cleanup(savedPhotos);
                    throw error;
                }
                // A network error may follow a committed DB write. Retain uncertain
                // files on persistence errors rather than deleting accepted photos.
                order = await deps.repository.saveAssets(order, savedPhotos, savedReferences);
                const acceptedPaths = new Set(order.asset_urls);
                const unusedFiles = [...savedPhotos, ...savedReferences].filter((file) => !acceptedPaths.has(file.path));
                await deps.cleanup(unusedFiles);
            }
            if (order.stripe_session_id) return jsonResponse(req, { url: await existingCheckout(order, deps), orderId: order.id });
            const metadata = { order_id: order.id, product_id: order.product_id, tenant_id: order.tenant_id };
            const session = await deps.createSession({
                mode: 'payment', payment_method_types: ['card'],
                line_items: [{ price_data: { currency: 'jpy', product_data: { name: order.options.productName }, unit_amount: order.amount }, quantity: 1 }],
                customer_email: order.customer_email,
                success_url: `${order.options.returnOrigin}/pet/order?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${order.options.returnOrigin}/pet/order?stripe=cancelled`,
                metadata, payment_intent_data: { metadata },
            }, `checkout:${order.id}`);
            if (!session.id || !session.url) throw new HttpError(503, '決済ページを作成できませんでした。時間をおいて再度お試しください。');
            assertMatchingSession({ ...order, stripe_session_id: session.id }, session);
            await deps.repository.saveSession(order.id, session.id, session.url);
            return jsonResponse(req, { url: session.url, orderId: order.id });
        } catch (error) {
            return respondError(req, error);
        }
    };
}
