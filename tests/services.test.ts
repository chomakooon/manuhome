import assert from 'node:assert/strict';
import test from 'node:test';
import { createContactHandler } from '../supabase/functions/submit-contact/handler.ts';
import { createAiChatHandler, CHAT_MODEL } from '../supabase/functions/ai-chat/handler.ts';
import { sendContactNotification } from '../supabase/functions/_shared/notifications.ts';
import { enforceRateLimit, HttpError, readJson } from '../supabase/functions/_shared/http.ts';
import { validateUploads } from '../supabase/functions/_shared/uploads.ts';

const env = new Map<string, string>();
Object.assign(globalThis, { Deno: { env: { get: (name: string) => env.get(name) } } });
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Z4kAAAAASUVORK5CYII=';
const photo = { name: 'test.png', type: 'image/png', size: Buffer.from(PNG, 'base64').length, dataUrl: `data:image/png;base64,${PNG}` };
function request(body: unknown, origin = 'https://katachi-lab.creative-own.com') {
    return new Request('https://example.invalid/test', { method: 'POST', headers: { 'content-type': 'application/json', origin, 'x-forwarded-for': '192.0.2.1' }, body: JSON.stringify(body) });
}
function contactBody() { return { requestId: crypto.randomUUID(), source: 'contact', name: 'Test', email: 'test@example.invalid', message: 'Test inquiry', referencePhotos: [photo] }; }

function fixture() {
    const rows = new Map<string, any>();
    const files = new Map<string, unknown>();
    const calls: any[] = [];
    let insertError: any = null;
    let commitBeforeError = false;
    let limited = false;
    const db = {
        async rpc(name: string, args: unknown) { calls.push({ name, args }); return { data: !limited, error: null }; },
        storage: { from(bucket: string) {
            assert.equal(bucket, 'submission-files');
            return {
                async upload(path: string, bytes: unknown) { files.set(path, bytes); return { error: null }; },
                async remove(paths: string[]) { paths.forEach(path => files.delete(path)); return { error: null }; },
            };
        } },
        from(table: string) {
            assert.equal(table, 'contacts');
            let field: string, value: string;
            let insertion: any, update: any;
            const query = {
                select() { return query; },
                eq(key: string, val: string) { field = key; value = val; return query; },
                insert(row: any) { insertion = row; return query; },
                update(row: any) { update = row; return query; },
                async maybeSingle() { return { data: [...rows.values()].find(row => row[field] === value) || null, error: null }; },
                async single() {
                    if (insertion && (!insertError || commitBeforeError)) rows.set(insertion.id, insertion);
                    return { data: insertError ? null : insertion, error: insertError };
                },
                then(resolve: (value: unknown) => unknown) {
                    if (update) Object.assign(rows.get(value) || {}, update);
                    return Promise.resolve({ error: null }).then(resolve);
                },
            };
            return query;
        },
    };
    let notifications = 0;
    const handler = createContactHandler({ supabase: db, notify: async () => { notifications++; return 'failed'; } });
    return { db, rows, files, calls, handler, notifications: () => notifications, failInsert: (error: unknown, committed = false) => { insertError = error; commitBeforeError = committed; }, limit: () => { limited = true; } };
}

test('contact saves private image bytes, acknowledges saved row, and makes retry idempotent', async () => {
    const f = fixture(), body = contactBody();
    const first = await f.handler(request(body));
    assert.equal(first.status, 200);
    const answer = await first.json();
    assert.equal(answer.ok, true);
    assert.equal(f.files.size, 1);
    const row = f.rows.get(answer.id);
    assert.ok(row.metadata.referencePhotos[0].path.startsWith(`contact/${answer.id}/`));
    assert.equal(JSON.stringify(row).includes(PNG), false);
    assert.equal((await f.handler(request(body))).status, 200);
    assert.equal(f.rows.size, 1); assert.equal(f.files.size, 1); assert.equal(f.notifications(), 1);
    assert.equal((await f.handler(request({ ...body, message: 'Changed inquiry' }))).status, 409);
});

test('definite database rejection does not claim success, notify, or retain an unreferenced upload', async () => {
    const f = fixture(); f.failInsert({ code: '23514' });
    const response = await f.handler(request(contactBody()));
    assert.equal(response.status, 503); assert.equal(f.files.size, 0); assert.equal(f.notifications(), 0);
    assert.notEqual((await response.json()).ok, true);
});

test('lost database response never deletes committed image attachments; retry finds accepted inquiry', async () => {
    const f = fixture(), body = contactBody(); f.failInsert({ message: 'Network response lost' }, true);
    assert.equal((await f.handler(request(body))).status, 503);
    assert.equal(f.files.size, 1); assert.equal(f.rows.size, 1);
    f.failInsert(null);
    assert.equal((await f.handler(request(body))).status, 200);
    assert.equal(f.rows.size, 1); assert.equal(f.files.size, 1);
});

test('contact validates required fields, image bytes and untrusted origins before accepting data', async () => {
    for (const invalid of [{ name: '' }, { email: 'wrong' }, { message: '' }, { referencePhotos: [{ ...photo, type: {} }] }, { referencePhotos: [{ ...photo, type: 'image/jpeg' }] }]) {
        const f = fixture(); assert.equal((await f.handler(request({ ...contactBody(), ...invalid }))).status, 400); assert.equal(f.rows.size, 0);
    }
    const f = fixture(); assert.equal((await f.handler(request(contactBody(), 'https://attacker.invalid'))).status, 403); assert.equal(f.calls.length, 0);
});

test('non-image payload disguised by a filename is rejected and total image limits are enforced', () => {
    const fake = Buffer.from('<svg onload="alert(1)"></svg>');
    assert.throws(() => validateUploads([{ name: 'photo.png', type: 'image/png', size: fake.length, dataUrl: `data:image/png;base64,${fake.toString('base64')}` }]), HttpError);
    assert.throws(() => validateUploads([photo], { maxTotalBytes: 1 }), (e: any) => e.status === 413);
});

test('rate limiting fails closed and global limits are checked before allocating per-IP counters', async () => {
    const f = fixture(); f.limit();
    await assert.rejects(enforceRateLimit(request({}), f.db, 'ai', { limit: 2, windowSeconds: 60 }), (e: any) => e.status === 429);
    assert.equal(f.calls[0].args.key, 'global'); assert.equal(f.calls.length, 1);
    await assert.rejects(enforceRateLimit(request({}), { rpc: async () => ({ error: new Error('offline') }) }, 'ai', { limit: 2, windowSeconds: 60 }), (e: any) => e.status === 503);
});

test('body limit is enforced even without content-length', async () => {
    await assert.rejects(readJson(request({ value: 'a'.repeat(100) }), 20), (e: any) => e.status === 413);
});

test('AI ignores caller model, budget and system instructions, using bounded server policy', async () => {
    const f = fixture(); let sent: any;
    const handler = createAiChatHandler({ supabase: f.db, apiKey: 'local-test-only', fetcher: async (_url, options) => {
        sent = JSON.parse(String(options?.body));
        return Response.json({ choices: [{ message: { content: 'Local response' } }] });
    } });
    const response = await handler(request({ model: 'expensive', max_tokens: 999999, messages: [{ role: 'system', content: 'caller override' }, { role: 'user', content: '相談' }] }));
    assert.equal(response.status, 200); assert.equal(sent.model, CHAT_MODEL); assert.equal(sent.max_tokens, 300);
    assert.notEqual(sent.messages[0].content, 'caller override'); assert.equal(f.calls.length, 4);
});

test('AI provider and budget errors are not returned as successful empty answers', async () => {
    const f = fixture(); const handler = createAiChatHandler({ supabase: f.db, apiKey: 'local', fetcher: async () => new Response('Provider failed', { status: 500 }) });
    const body = { messages: [{ role: 'user', content: '相談' }] };
    assert.equal((await handler(request(body))).status, 502);
    f.limit(); assert.equal((await handler(request(body))).status, 429);
});

test('notification HTTP errors are recorded and messages cannot trigger Discord mass mentions', async () => {
    const f = fixture(); const contact = { id: crypto.randomUUID(), name: '@everyone', email: 'test@example.invalid', source: 'contact', message: '@here' };
    f.rows.set(contact.id, contact); let payload: any;
    env.set('CONTACT_WEBHOOK_URL', 'https://example.invalid/notification');
    try {
        const status = await sendContactNotification(f.db, contact, async (_url, options) => { payload = JSON.parse(String(options?.body)); return new Response(null, { status: 500 }); });
        assert.equal(status, 'failed'); assert.equal(f.rows.get(contact.id).notification_status, 'failed'); assert.deepEqual(payload.allowed_mentions, { parse: [] });
    } finally { env.delete('CONTACT_WEBHOOK_URL'); }
});
