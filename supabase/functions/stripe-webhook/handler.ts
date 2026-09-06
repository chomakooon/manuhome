import { assertMatchingSession } from '../_shared/commerce.ts';
import type { CheckoutSession, CommerceRepository } from '../_shared/commerce.ts';

export type StripeEvent = { id: string; type: string; data: { object: unknown } };

async function boundedText(req: Request): Promise<string> {
    if (!req.body) throw new Error('Empty webhook');
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 1024 * 1024) { await reader.cancel(); throw new Error('Webhook too large'); }
        chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new TextDecoder().decode(bytes);
}

export function stripeWebhookHandler(deps: {
    repository: CommerceRepository;
    verifyEvent(body: string, signature: string): Promise<StripeEvent>;
}) {
    return async (req: Request): Promise<Response> => {
        if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
        const signature = req.headers.get('stripe-signature');
        if (!signature) return new Response('Missing signature', { status: 400 });
        let event: StripeEvent;
        try {
            event = await deps.verifyEvent(await boundedText(req), signature);
        } catch {
            return new Response('Invalid webhook signature or payload', { status: 400 });
        }
        if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) return Response.json({ received: true });
        const session = event.data.object as CheckoutSession;
        // A completed checkout can still be awaiting settlement for delayed payment methods.
        if (session.payment_status !== 'paid') return Response.json({ received: true });
        try {
            const order = await deps.repository.findBySession(session.id);
            if (!order) throw new Error('Saved checkout association not found');
            assertMatchingSession(order, session);
            const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
            if (!paymentIntent) throw new Error('Paid checkout has no payment intent');
            await deps.repository.fulfill({
                p_event_id: event.id, p_session_id: session.id, p_order_id: order.id,
                p_payment_intent: paymentIntent, p_amount: order.amount, p_currency: order.currency,
            });
            return Response.json({ received: true });
        } catch (error) {
            // Stripe retries non-2xx responses; DB failures must never acknowledge a lost order.
            console.error('Checkout fulfillment failed', { eventId: event.id, error: error instanceof Error ? error.message : 'Unknown error' });
            return new Response('Fulfillment unavailable; retry required', { status: 503 });
        }
    };
}
