import { test, expect } from '@playwright/test';

async function isolate(page, handler) {
    await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.hostname === 'local-audit.supabase.co') return handler(route);
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
        return route.continue();
    });
}

test('AI sends bounded recent conversation, reports service errors, and resets stored history', async ({ page }) => {
    const requests = [];
    let fail = false;
    await isolate(page, route => {
        requests.push(route.request().postDataJSON());
        return route.fulfill({ status: fail ? 502 : 200, json: fail ? { error: 'Synthetic failure' } : { reply: '検証用の回答です。' } });
    });
    await page.addInitScript(() => {
        sessionStorage.setItem('katachi_aichat_messages', JSON.stringify(Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: '以前の会話'.repeat(300) }))));
    });
    await page.goto('/contact');
    await page.getByRole('button', { name: 'AIアシスタントに相談する' }).click();
    await page.getByRole('textbox', { name: 'AIへの質問' }).fill('最近の質問');
    await page.getByRole('button', { name: '質問を送信' }).click();
    await expect(page.locator('.ai-chat-messages')).toContainText('検証用の回答です。');
    expect(Object.keys(requests[0])).toEqual(['messages']);
    expect(requests[0].messages.length).toBeLessThanOrEqual(20);
    expect(requests[0].messages.at(-1)).toEqual({ role: 'user', content: '最近の質問' });
    expect(requests[0].messages.reduce((sum, message) => sum + message.content.length, 0)).toBeLessThanOrEqual(12000);
    expect(new TextEncoder().encode(JSON.stringify(requests[0])).length).toBeLessThan(32768);
    fail = true;
    await page.getByRole('textbox', { name: 'AIへの質問' }).fill('失敗時の確認');
    await page.getByRole('button', { name: '質問を送信' }).click();
    await expect(page.locator('.ai-chat-messages')).toContainText('AIの応答を取得できませんでした');
    await page.getByRole('button', { name: '会話をリセット' }).click();
    await expect(page.locator('.ai-chat-msg')).toHaveCount(1);
    await expect(page.locator('.ai-chat-messages')).not.toContainText('最近の質問');
});

test('reset discards a late AI response and rapid sends create one request', async ({ page }) => {
    let pending;
    let calls = 0;
    await isolate(page, route => { calls += 1; pending = route; });
    await page.goto('/contact');
    await page.getByRole('button', { name: 'AIアシスタントに相談する' }).click();
    await page.getByRole('textbox', { name: 'AIへの質問' }).fill('送信中の質問');
    await page.getByRole('button', { name: '質問を送信' }).evaluate(button => { button.click(); button.click(); button.click(); });
    await expect.poll(() => calls).toBe(1);
    await page.getByRole('button', { name: '会話をリセット' }).click();
    await pending.fulfill({ json: { reply: 'リセット前の遅い回答' } });
    await expect(page.getByRole('textbox', { name: 'AIへの質問' })).toBeEnabled();
    await page.getByRole('textbox', { name: 'AIへの質問' }).fill('新しい質問');
    await page.getByRole('button', { name: '質問を送信' }).click();
    await expect.poll(() => calls).toBe(2);
    await pending.fulfill({ json: { reply: 'リセット後の回答' } });
    await expect(page.locator('.ai-chat-messages')).toContainText('リセット後の回答');
    await expect(page.locator('.ai-chat-messages')).not.toContainText('リセット前の遅い回答');
});

test('contact rejects an unsaved success response and keeps the same retry ID', async ({ page }) => {
    const requests = [];
    await isolate(page, route => {
        requests.push(route.request().postDataJSON());
        return route.fulfill({ json: { ok: true, id: requests.length === 1 ? null : '11111111-1111-4111-8111-111111111111' } });
    });
    await page.goto('/contact');
    const results = await page.evaluate(async () => {
        const { submitContact } = await import('/src/lib/contact.js');
        const payload = { name: 'Local', email: 'local@example.invalid', message: 'Local test' };
        let rejected = false;
        try { await submitContact(payload); } catch { rejected = true; }
        return { rejected, accepted: await submitContact(payload) };
    });
    expect(results.rejected).toBe(true);
    expect(results.accepted.id).toBeTruthy();
    expect(requests[0].requestId).toBe(requests[1].requestId);
});

test('older successful contact cannot erase a newer request retry token', async ({ page }) => {
    const requests = [];
    let first;
    let second;
    await isolate(page, route => {
        requests.push(route.request().postDataJSON());
        if (requests.length === 1) { first = route; return; }
        if (requests.length === 2) { second = route; return; }
        return route.fulfill({ json: { ok: true, id: '22222222-2222-4222-8222-222222222222' } });
    });
    await page.goto('/contact');
    const submitting = page.evaluate(async () => {
        const { submitContact } = await import('/src/lib/contact.js');
        const payload = { source: 'contact', name: 'Local', email: 'local@example.invalid', message: 'A' };
        const a = submitContact(payload);
        const b = submitContact({ ...payload, message: 'B' }).catch(() => null);
        await Promise.all([a, b]);
        return submitContact({ ...payload, message: 'B' });
    });
    await expect.poll(() => requests.length).toBe(2);
    await first.fulfill({ json: { ok: true, id: '11111111-1111-4111-8111-111111111111' } });
    await second.fulfill({ status: 503, json: { error: 'Synthetic uncertain response' } });
    await submitting;
    expect(requests).toHaveLength(3);
    expect(requests[2].requestId).toBe(requests[1].requestId);
});
