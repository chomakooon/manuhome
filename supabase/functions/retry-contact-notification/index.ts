import { createClient } from 'npm:@supabase/supabase-js@2.115.0';
import { corsResponse, enforceRateLimit, HttpError, jsonResponse, readJson, respondError } from '../_shared/http.ts';
import { sendContactNotification } from '../_shared/notifications.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
Deno.serve(async req => {
    try {
        const preflight = corsResponse(req);
        if (preflight) return preflight;
        const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
        if (!token) throw new HttpError(401, 'ログインしてください。');
        const auth = await supabase.auth.getUser(token);
        if (auth.error || !auth.data.user) throw new HttpError(401, 'ログインし直してください。');
        const profile = await supabase.from('profiles').select('role,tenant_id').eq('id', auth.data.user.id).single();
        if (profile.error || profile.data?.role !== 'creator') throw new HttpError(403, '管理者権限が必要です。');
        await enforceRateLimit(req, supabase, 'retry-contact', { limit: 20, windowSeconds: 3600, globalLimit: 100 });
        const body = await readJson(req, 1024);
        if (typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id)) throw new HttpError(400, '受付番号を確認してください。');
        const contact = await supabase.from('contacts').select('*').eq('id', body.id).eq('tenant_id', profile.data.tenant_id).single();
        if (contact.error || !contact.data) throw new HttpError(404, 'お問い合わせが見つかりません。');
        if (contact.data.notification_status === 'sent') return jsonResponse(req, { ok: true, notificationStatus: 'sent' });
        const status = await sendContactNotification(supabase, contact.data);
        if (status === 'failed') throw new HttpError(502, '通知先への送信に失敗しました。お問い合わせは保存されています。');
        return jsonResponse(req, { ok: true, notificationStatus: status });
    } catch (error) { return respondError(req, error); }
});
