import { corsResponse, HttpError, jsonResponse, readJson, respondError } from '../_shared/http.ts';
import { assertMatchingSession, SESSION_ID } from '../_shared/commerce.ts';
import type { CheckoutSession, CommerceRepository } from '../_shared/commerce.ts';

export function checkoutStatusHandler(deps: {
    repository: CommerceRepository;
    rateLimit(req: Request): Promise<void>;
    retrieveSession(id: string): Promise<CheckoutSession>;
}) {
    return async (req: Request): Promise<Response> => {
        try {
            const preflight = corsResponse(req);
            if (preflight) return preflight;
            if (req.method !== 'POST') throw new HttpError(405, 'POSTで送信してください。');
            await deps.rateLimit(req);
            const body = await readJson(req, 1024) as { sessionId?: unknown };
            if (!body || typeof body.sessionId !== 'string' || !SESSION_ID.test(body.sessionId)) throw new HttpError(400, '決済IDをご確認ください。');
            const order = await deps.repository.findBySession(body.sessionId);
            if (!order) throw new HttpError(404, '決済情報を確認できませんでした。');
            const session = await deps.retrieveSession(body.sessionId);
            assertMatchingSession(order, session);
            // Stripe Checkout retains payment_status=paid after a refund. The
            // separate saved payment state prevents presenting it as processing.
            if (order.payment_status === 'refunded') return jsonResponse(req, { paymentStatus: 'refunded', orderStatus: 'pending' });
            const paid = session.payment_status === 'paid';
            const paymentStatus = paid ? 'paid' : session.status === 'complete' ? 'pending' : 'unpaid';
            const orderStatus = paid && order.payment_status === 'paid' ? 'confirmed' : paid ? 'processing' : 'pending';
            return jsonResponse(req, { paymentStatus, orderStatus });
        } catch (error) {
            return respondError(req, error);
        }
    };
}
