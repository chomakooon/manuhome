import { corsResponse, enforceRateLimit, HttpError, jsonResponse, optionalText, readJson, requiredText, respondError, sha256 } from '../_shared/http.ts';
import { cleanupUploads, saveUploads, validateUploads } from '../_shared/uploads.ts';
import { sendContactNotification } from '../_shared/notifications.ts';

const SOURCES = new Set(['contact', 'kataribin-contact', 'intake', 'pawspress-contact']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createContactHandler({ supabase, notify = sendContactNotification }: { supabase: any; notify?: typeof sendContactNotification }) {
    return async (req: Request): Promise<Response> => {
        try {
            const preflight = corsResponse(req);
            if (preflight) return preflight;
            await enforceRateLimit(req, supabase, 'contact-hour', { limit: 8, windowSeconds: 3600, globalLimit: 200 });
            const body = await readJson(req, 22 * 1024 * 1024);
            if (!UUID.test(body.requestId)) throw new HttpError(400, '受付番号の形式を確認してください。');
            const source = body.source || 'contact';
            if (!SOURCES.has(source)) throw new HttpError(400, 'お問い合わせ種別を確認してください。');
            const name = requiredText(body.name, 'お名前', 100);
            const email = requiredText(body.email, 'メールアドレス', 254).toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'メールアドレスを確認してください。');
            const message = requiredText(body.message, 'お問い合わせ内容', 10_000);
            const phone = optionalText(body.phone, '電話番号', 40);
            if (body.metadata != null && (typeof body.metadata !== 'object' || Array.isArray(body.metadata))) throw new HttpError(400, '付随情報の形式を確認してください。');
            const metadata = { ...(body.metadata || {}) };
            delete metadata.referencePhotos;
            if (JSON.stringify(metadata).length > 20_000) throw new HttpError(413, 'お問い合わせの付随情報が長すぎます。');
            const uploads = validateUploads(body.referencePhotos, { maxFiles: 3, maxFileBytes: 5 * 1024 * 1024, maxTotalBytes: 15 * 1024 * 1024 });
            const fingerprint = await sha256(JSON.stringify({ source, name, email, phone, message, metadata, referencePhotos: body.referencePhotos || [] }));
            const findRequest = () => supabase.from('contacts').select('id,request_hash').eq('request_id', body.requestId).maybeSingle();
            const existing = await findRequest();
            if (existing.error) throw new HttpError(503, '受付状況の確認に失敗しました。再度お試しください。');
            if (existing.data) {
                if (existing.data.request_hash !== fingerprint) throw new HttpError(409, '入力内容が変わりました。ページを再読込みしてお試しください。');
                return jsonResponse(req, { ok: true, id: existing.data.id });
            }
            const id = crypto.randomUUID();
            const files = await saveUploads(supabase, `contact/${id}`, uploads);
            const contact = { id, source, name, email, phone, message, metadata: { ...metadata, referencePhotos: files }, request_id: body.requestId, request_hash: fingerprint };
            const saved = await supabase.from('contacts').insert(contact).select('id').single();
            if (saved.error || !saved.data) {
                // Integrity failures cannot have committed this INSERT. A transport
                // failure can happen after commit, so retain those files for retry.
                if (/^23/.test(saved.error?.code || '')) await cleanupUploads(supabase, files);
                if (saved.error?.code === '23505') {
                    const raced = await findRequest();
                    if (!raced.error && raced.data?.request_hash === fingerprint) return jsonResponse(req, { ok: true, id: raced.data.id });
                }
                throw new HttpError(503, 'お問い合わせを保存できませんでした。入力内容を残して再度お試しください。');
            }
            // Acceptance depends on durable storage, not notification delivery.
            await notify(supabase, contact);
            return jsonResponse(req, { ok: true, id });
        } catch (error) { return respondError(req, error); }
    };
}
