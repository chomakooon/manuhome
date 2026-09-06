import assert from 'node:assert/strict';
import test from 'node:test';
import { createMangaPreviewHandler, MANGA_MODEL } from '../supabase/functions/generate-manga-preview/handler.ts';

Object.assign(globalThis, { Deno: { env: { get: () => undefined } } });
const USER_ID = 'dc63d4a1-792a-4cbb-a16c-1539b0840a1b';
function request(body: unknown = { hearingData: { product_service: 'テスト製品', message: 'テストの相談' } }, token = 'valid') {
    const headers: Record<string, string> = { 'content-type': 'application/json', origin: 'https://katachi-lab.creative-own.com' };
    if (token) headers.authorization = `Bearer ${token}`;
    return new Request('https://example.invalid/manga', { method: 'POST', headers, body: JSON.stringify(body) });
}
function fixture() {
    let role = 'creator';
    let quota = true;
    const counters: unknown[] = [];
    const supabase = {
        auth: { async getUser(token: string) { return token === 'valid' ? { data: { user: { id: USER_ID } }, error: null } : { data: { user: null }, error: new Error('invalid token') }; } },
        from(table: string) {
            assert.equal(table, 'profiles');
            return { select(columns: string) {
                assert.equal(columns, 'role');
                return { eq(column: string, id: string) {
                    assert.equal(column, 'id'); assert.equal(id, USER_ID);
                    return { async single() { return { data: { role }, error: null }; } };
                } };
            } };
        },
        async rpc(name: string, args: unknown) { assert.equal(name, 'consume_rate_limit'); counters.push(args); return { data: quota, error: null }; },
    };
    return { supabase, counters, customer: () => { role = 'customer'; }, denyQuota: () => { quota = false; } };
}

test('manga generation requires a verified creator before spending quota or calling the provider', async () => {
    const f = fixture(); let providerCalls = 0;
    const handler = createMangaPreviewHandler({ supabase: f.supabase, apiKey: 'synthetic', fetcher: async () => { providerCalls++; return Response.json({}); } });
    assert.equal((await handler(request(undefined, ''))).status, 401);
    assert.equal((await handler(request(undefined, 'invalid'))).status, 401);
    f.customer(); assert.equal((await handler(request())).status, 403);
    assert.equal(providerCalls, 0); assert.equal(f.counters.length, 0);
});

test('four manga variants run concurrently with one deadline and explicit image modalities', { timeout: 2000 }, async () => {
    const f = fixture(); const bodies: any[] = []; const signals: AbortSignal[] = [];
    let release: () => void = () => {};
    const allStarted = new Promise<void>((resolve) => { release = resolve; });
    const handler = createMangaPreviewHandler({ supabase: f.supabase, apiKey: 'synthetic', fetcher: async (_url, options) => {
        const index = bodies.length;
        bodies.push(JSON.parse(String(options?.body)));
        signals.push(options!.signal as AbortSignal);
        if (bodies.length === 4) release();
        await allStarted;
        return Response.json({ choices: [{ message: { images: [{ image_url: { url: `https://example.invalid/variant-${index}.png` } }] } }] });
    } });
    const response = await handler(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { images: Array.from({ length: 4 }, (_, index) => `https://example.invalid/variant-${index}.png`) });
    assert.equal(new Set(signals).size, 1);
    for (const body of bodies) {
        assert.equal(body.model, MANGA_MODEL);
        assert.deepEqual(body.modalities, ['image', 'text']);
        assert.equal(body.max_tokens, 1024);
    }
});

test('failed manga variant aborts sibling requests and never returns partial success', async () => {
    const f = fixture(); const signals: AbortSignal[] = [];
    const handler = createMangaPreviewHandler({ supabase: f.supabase, apiKey: 'synthetic', fetcher: async (_url, options) => {
        signals.push(options!.signal as AbortSignal);
        if (signals.length === 1) return new Response('provider unavailable', { status: 503 });
        return Response.json({ choices: [{ message: { images: [{ image_url: { url: 'https://example.invalid/image.png' } }] } }] });
    } });
    const response = await handler(request());
    assert.equal(response.status, 502);
    assert.equal('images' in await response.json(), false);
    assert.ok(signals.every((signal) => signal.aborted));
});

test('missing provider key, exhausted quota, and more than four variants never call image generation', async () => {
    const f = fixture(); let calls = 0;
    const fetcher = async () => { calls++; return Response.json({}); };
    assert.equal((await createMangaPreviewHandler({ supabase: f.supabase, apiKey: undefined, fetcher })(request())).status, 503);
    const handler = createMangaPreviewHandler({ supabase: f.supabase, apiKey: 'synthetic', fetcher });
    assert.equal((await handler(request({ hearingData: {}, patternCount: 5 }))).status, 400);
    f.denyQuota(); assert.equal((await handler(request())).status, 429);
    assert.equal(calls, 0);
});

test('text-only or unusable provider output is an error even with HTTP 200', async () => {
    for (const message of [{ content: 'text without an image' }, { images: [{ image_url: { url: 'javascript:alert(1)' } }] }]) {
        const f = fixture();
        const handler = createMangaPreviewHandler({ supabase: f.supabase, apiKey: 'synthetic', fetcher: async () => Response.json({ choices: [{ message }] }) });
        assert.equal((await handler(request({ hearingData: {}, patternCount: 1 }))).status, 502);
    }
});
