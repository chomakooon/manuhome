import { supabase, isSupabaseConfigured } from './supabase';

// Keep retry tokens in memory; never persist customer details in storage.
const pendingRequests = new Map();

export async function submitContact({ source = 'contact', name = '', email = '', phone = '', message = '', metadata = {}, referencePhotos = [] }) {
    if (!isSupabaseConfigured) throw new Error('お問い合わせの受付を準備しています。時間をおいてお試しください。');
    const payload = { source, name, email, phone, message, metadata, referencePhotos };
    const fingerprint = JSON.stringify(payload);
    let pending = pendingRequests.get(source);
    if (pending?.fingerprint !== fingerprint) {
        pending = { fingerprint, requestId: crypto.randomUUID() };
        pendingRequests.set(source, pending);
    }
    const { data, error } = await supabase.functions.invoke('submit-contact', {
        body: { ...payload, requestId: pending.requestId },
    });
    if (error) throw error;
    if (data?.ok !== true || typeof data.id !== 'string' || !data.id) throw new Error('受付を確認できませんでした。再度お試しください。');
    if (pendingRequests.get(source) === pending) pendingRequests.delete(source);
    return data;
}
