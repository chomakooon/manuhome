export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

export function requestOrigin(req: Request): string {
    const canonical = Deno.env.get('SITE_URL') || 'https://katachi-lab.creative-own.com';
    const allowed = new Set([
        new URL(canonical).origin,
        'https://manuhome.vercel.app',
        ...(Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean),
    ]);
    const origin = req.headers.get('origin');
    if (origin && !allowed.has(origin)) throw new HttpError(403, 'このサイトからは送信できません。');
    return origin || new URL(canonical).origin;
}

function responseHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin',
    };
    try { headers['Access-Control-Allow-Origin'] = requestOrigin(req); } catch { /* No CORS grant for an untrusted origin. */ }
    return headers;
}

export function corsResponse(req: Request): Response | null {
    requestOrigin(req);
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: {
            ...responseHeaders(req),
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Max-Age': '600',
        } });
    }
    if (req.method !== 'POST') throw new HttpError(405, 'POSTで送信してください。');
    return null;
}

export function jsonResponse(req: Request, body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: responseHeaders(req) });
}

export function respondError(req: Request, error: unknown): Response {
    if (error instanceof HttpError) return jsonResponse(req, { error: error.message }, error.status);
    // Never log request bodies, credentials, customer details or provider response bodies.
    console.error('Request failed', error instanceof Error ? error.name : 'UnknownError');
    return jsonResponse(req, { error: '処理に失敗しました。時間をおいて再度お試しください。' }, 500);
}

export async function readJson(req: Request, maxBytes = 64 * 1024): Promise<any> {
    if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
        throw new HttpError(415, 'JSON形式で送信してください。');
    }
    if (Number(req.headers.get('content-length')) > maxBytes) throw new HttpError(413, '送信データが大きすぎます。');
    const reader = req.body?.getReader();
    if (!reader) throw new HttpError(400, '入力内容がありません。');
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let bytes = 0;
    let text = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > maxBytes) {
                await reader.cancel();
                throw new HttpError(413, '送信データが大きすぎます。');
            }
            text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
        const body = JSON.parse(text);
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid object');
        return body;
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(400, '入力内容を確認してください。');
    } finally {
        reader.releaseLock();
    }
}

export async function sha256(value: string): Promise<string> {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export async function enforceRateLimit(
    req: Request,
    supabase: any,
    scope: string,
    { limit, windowSeconds, globalLimit = limit * 50 }: { limit: number; windowSeconds: number; globalLimit?: number },
): Promise<void> {
    // The gateway supplies this header. A separate global limit caps cost even if
    // a deployment forwards an untrusted or missing client address.
    const clientIp = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    const key = await sha256(`${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''}:${clientIp}`);
    for (const [bucket, maxRequests] of [['global', globalLimit], [key, limit]] as const) {
        const { data, error } = await supabase.rpc('consume_rate_limit', {
            scope, key: bucket, max_requests: maxRequests, window_seconds: windowSeconds,
        });
        if (error) throw new HttpError(503, 'ただいま受付を一時停止しています。時間をおいてお試しください。');
        if (data !== true) throw new HttpError(429, '送信回数の上限に達しました。時間をおいてお試しください。');
    }
}

export function requiredText(value: unknown, label: string, maxLength: number): string {
    if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
        throw new HttpError(400, `${label}を確認してください。`);
    }
    return value.trim();
}

export function optionalText(value: unknown, label: string, maxLength: number): string {
    if (value == null || value === '') return '';
    return requiredText(value, label, maxLength);
}
