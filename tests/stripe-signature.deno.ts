import Stripe from 'npm:stripe@22.6.1';

// Synthetic secret and payload only. No Stripe API call is made by these tests.
const stripe = new Stripe('sk_test_local_signature_fixture');
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const secret = 'whsec_synthetic_local_fixture';
const payload = JSON.stringify({ id: 'evt_synthetic', type: 'checkout.session.completed', data: { object: { id: 'cs_test_synthetic', payment_status: 'paid' } } });

Deno.test('Stripe Web Crypto verifies a real HMAC fixture asynchronously in Deno', async () => {
    const signature = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret, cryptoProvider });
    const event = await stripe.webhooks.constructEventAsync(payload, signature, secret, undefined, cryptoProvider);
    if (event.id !== 'evt_synthetic') throw new Error('Signature fixture event was not decoded');
});

Deno.test('Stripe rejects a body altered after the signature was generated', async () => {
    const signature = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret, cryptoProvider });
    try {
        await stripe.webhooks.constructEventAsync(payload.replace('paid', 'unpaid'), signature, secret, undefined, cryptoProvider);
    } catch (error) {
        if (error instanceof Stripe.errors.StripeSignatureVerificationError) return;
        throw error;
    }
    throw new Error('Altered event must not verify');
});
