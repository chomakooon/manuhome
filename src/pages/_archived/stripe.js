import { loadStripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

let stripePromise;
export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(stripeKey);
    }
    return stripePromise;
};

/**
 * Create a Stripe Checkout session by calling the Supabase Edge Function.
 * In development without a backend, this will simulate the flow.
 */
export async function createCheckoutSession({ productName, productId, amount, orderId, customerEmail, assetUrls = [], tenantId = '00000000-0000-0000-0000-000000000000', metadata = {} }) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        // Demo mode — simulate checkout
        console.log('🛒 Demo mode: simulating checkout', { productName, productId, amount, orderId, assetUrls, tenantId, metadata });
        return { url: `/order/success?session_id=demo_${orderId}` };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, productId, amount, orderId, customerEmail, assetUrls, tenantId, metadata }),
    });

    const data = await response.json();
    return data;
}
