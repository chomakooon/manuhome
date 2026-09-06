import { supabase, isSupabaseConfigured } from './supabase';

export const isStripeConfigured = isSupabaseConfigured;
let pendingOrder;

async function invoke(name, body) {
    if (!isSupabaseConfigured) throw new Error('ただいま決済を利用できません。お問い合わせください。');
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error) {
        let message = '通信に失敗しました。入力内容を残して再度お試しください。';
        try {
            const response = await error.context?.json();
            if (typeof response?.error === 'string') message = response.error;
        } catch { /* Keep the transport failure message. */ }
        throw new Error(message);
    }
    if (data?.error) throw new Error(data.error);
    return data;
}

export async function createCheckoutSession(submission) {
    const fingerprint = JSON.stringify(submission);
    if (pendingOrder?.fingerprint !== fingerprint) pendingOrder = { fingerprint, requestId: crypto.randomUUID() };
    const data = await invoke('create-checkout', { submission, requestId: pendingOrder.requestId });
    let url;
    try { url = new URL(data?.url); } catch { throw new Error('決済ページを確認できませんでした。'); }
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('決済ページを確認できませんでした。');
    return { url: url.href, orderId: data.orderId };
}

export async function getCheckoutStatus(sessionId) {
    if (!sessionId) throw new Error('決済IDを確認できませんでした。');
    const data = await invoke('checkout-status', { sessionId });
    if (!['paid', 'pending', 'unpaid', 'refunded'].includes(data?.paymentStatus) || !['confirmed', 'processing', 'pending'].includes(data?.orderStatus)) throw new Error('受付状況を確認できませんでした。');
    return data;
}
