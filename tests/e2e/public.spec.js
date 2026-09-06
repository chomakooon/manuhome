import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

async function mockPublicBackend(page, state = {}) {
    await page.route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.hostname.endsWith('.supabase.co')) {
            if (url.pathname.endsWith('/submit-contact')) {
                state.requests ??= [];
                state.requests.push(request.postDataJSON());
                return route.fulfill({
                    status: state.contactStatus ?? 200,
                    json: state.contactStatus === 503
                        ? { error: 'Local simulated save failure' }
                        : { ok: true, id: '11111111-1111-4111-8111-111111111111' },
                });
            }
            return route.fulfill({ status: 429, json: { code: 'over_request_rate_limit', msg: 'Local rate limit' } });
        }
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
        return route.continue();
    });
}

test('detailed consultation retains inputs after a save failure and retries to an in-place confirmation', async ({ page }) => {
    const state = { contactStatus: 503 };
    await mockPublicBackend(page, state);
    await page.goto('/intake?type=other');
    await page.locator('#intake-name').fill('Local verification');
    await page.locator('#intake-email').fill('local@example.invalid');
    await page.locator('#intake-goal').selectOption('その他');
    await page.locator('#intake-budget').selectOption('未定・相談したい');
    await page.getByRole('button', { name: '相談内容を送る' }).click();
    await expect(page.getByRole('alert')).toContainText('送信に失敗');
    await expect(page.locator('#intake-name')).toHaveValue('Local verification');
    await expect(page).toHaveURL(/\/intake/);
    expect(state.requests[0].message).toContain('その他のご相談');
    state.contactStatus = 200;
    await page.getByRole('button', { name: '相談内容を送る' }).click();
    await expect(page.getByRole('heading', { name: 'ご相談を受け付けました' })).toBeVisible();
    await expect(page).toHaveURL(/\/intake/);
    expect(state.requests[1].requestId).toBe(state.requests[0].requestId);
});

test('rapid diagnostic selection advances once and recommendation pre-fills a working consultation', async ({ page }) => {
    await mockPublicBackend(page);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('/diagnostic');
    await page.locator('.diagnostic-quiz-btn').first().evaluate(button => {
        button.click(); button.click(); button.click();
    });
    await expect(page.locator('.diagnostic-quiz-progress')).toHaveText('Step 2 / 3');
    await page.locator('.diagnostic-quiz-btn').first().click();
    await expect(page.locator('.diagnostic-quiz-progress')).toHaveText('Step 3 / 3');
    await page.locator('.diagnostic-quiz-btn').first().click();
    await expect(page.locator('.diagnostic-result-title')).toContainText('図解イラスト');
    await page.locator('.diagnostic-cta-box .btn-primary').click();
    await expect(page).toHaveURL(/\/contact\?diagnostic=diagram/);
    await expect(page.locator('#contact-message')).toHaveValue(/図解イラスト/);
    expect(pageErrors).toEqual([]);
});

test('consultation sends image bytes to private storage intake, without storing duplicate image metadata', async ({ page }) => {
    const state = {};
    await mockPublicBackend(page, state);
    await page.goto('/contact');
    await page.locator('#contact-name').fill('Local photo verification');
    await page.locator('#contact-email').fill('local@example.invalid');
    await page.locator('#contact-message').fill('Local reference photo');
    await page.locator('input[type=file]').setInputFiles({
        name: 'local.png', mimeType: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Z4kAAAAASUVORK5CYII=', 'base64'),
    });
    await expect(page.locator('.kt-photo-item')).toHaveCount(1);
    await page.locator('button[type=submit]').click();
    await expect(page.locator('.kt-contact-completed')).toBeVisible();
    expect(state.requests[0].referencePhotos[0].dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(state.requests[0].metadata).not.toHaveProperty('referencePhotos');
});

test('password reset errors are shown without a success message', async ({ page }) => {
    await mockPublicBackend(page);
    await page.goto('/admin/login');
    await page.locator('#admin-email').fill('local@example.invalid');
    await page.getByRole('button', { name: /パスワードを忘れ/ }).click();
    await expect(page.getByRole('alert')).toContainText('再設定メールの送信に失敗');
    await expect(page.getByRole('status')).toHaveCount(0);
});

test('old consultation URLs preserve diagnostic intent and unknown routes offer navigation', async ({ page }) => {
    await mockPublicBackend(page);
    await page.goto('/order?category=icon');
    await expect(page.locator('#contact-message')).toHaveValue(/SNSアイコン/);
    await page.goto('/missing-test-only');
    await expect(page.getByRole('heading', { name: 'ページが見つかりません' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ホームに戻る', exact: true })).toBeVisible();
});
