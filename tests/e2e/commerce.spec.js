import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Z4kAAAAASUVORK5CYII=', 'base64');
const image = name => ({ name, mimeType: 'image/png', buffer: png });
const checkoutUrl = 'https://checkout.stripe.com/c/pay/cs_test_local0000000000000000';
const sessionId = 'cs_test_local0000000000000000';

async function mockCommerce(page, state = {}) {
    state.requests = [];
    state.statusRequests = 0;
    await page.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.hostname.endsWith('.supabase.co')) {
            if (url.pathname.endsWith('/create-checkout')) {
                state.requests.push(request.postDataJSON());
                return route.fulfill({
                    status: state.checkoutFailure ? 503 : 200,
                    json: state.checkoutFailure ? { error: 'ローカル決済テストの一時エラー' }
                        : { url: checkoutUrl, orderId: '22222222-2222-4222-8222-222222222222' },
                });
            }
            if (url.pathname.endsWith('/checkout-status')) {
                state.statusRequests++;
                const status = state.statuses?.length > 1 ? state.statuses.shift()
                    : state.statuses?.[0] || { paymentStatus: 'paid', orderStatus: 'confirmed' };
                return route.fulfill({ status: state.statusFailure ? 503 : 200, json: state.statusFailure ? { error: 'Local verification failure' } : status });
            }
            return route.fulfill({ status: 401, json: { error: 'Local test endpoint unavailable' } });
        }
        if (url.hostname === 'checkout.stripe.com') return route.fulfill({ contentType: 'text/html', body: '<h1>Local Stripe Checkout</h1>' });
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
        return route.continue();
    });
}

async function next(page) {
    await page.getByRole('button', { name: '次へ →', exact: true }).click();
}

async function choosePlan(page, { custom = false } = {}) {
    await page.goto('/pet/order');
    await page.locator('label[for="plan-pet-single"]').click();
    await page.locator('label[for="goods-single-Tシャツ"]').click();
    await page.getByLabel('Tシャツのサイズ').selectOption('L');
    if (custom) {
        await page.locator('label[for="art-other"]').click();
        await page.locator('#art-other-detail').fill('Local custom illustration');
        await page.locator('.paws-art-other input[type=file]').setInputFiles(image('reference.png'));
        await expect(page.locator('.paws-art-other__filename')).toHaveText('reference.png');
        await page.locator('#gift-wrap').check();
        await page.locator('#gift-message').fill('Local gift message');
    }
    await next(page);
    await page.locator('input[type=file]').setInputFiles(image('pet.png'));
    await expect(page.locator('.paws-photo-item')).toHaveCount(1);
    await next(page);
}

async function fillCustomer(page, { phone = '090-0000-0000' } = {}) {
    await page.getByPlaceholder('山田 太郎', { exact: true }).fill('Local Customer');
    await page.getByPlaceholder('example@example.com', { exact: true }).fill('customer@example.invalid');
    await page.getByPlaceholder('090-0000-0000', { exact: true }).fill(phone);
    await page.getByPlaceholder('モカ', { exact: true }).fill('Local Pet');
    await page.getByPlaceholder(/^例: ミニチュアダックスフンド/).fill('Local pet details');
    await page.getByPlaceholder('123-4567', { exact: true }).fill('123-4567');
    await page.getByPlaceholder('東京都新宿区...', { exact: true }).fill('Local delivery address');
    await page.getByPlaceholder('特別なご要望などあればお聞かせください', { exact: true }).fill('Local customer note');
}

async function reachReview(page, options) {
    await choosePlan(page, options);
    await fillCustomer(page);
    await next(page);
    await expect(page.getByRole('heading', { name: 'ご入力内容をご確認ください' })).toBeVisible();
}

test('all order steps preserve photos, shipping, gift and consent through checkout failure and stable-id retry', async ({ page }) => {
    const state = { checkoutFailure: true };
    await mockCommerce(page, state);
    await reachReview(page, { custom: true });
    await page.getByLabel('紹介コード', { exact: true }).fill('LOCAL-REF');
    await page.getByRole('button', { name: 'お支払いに進む →', exact: true }).click();
    await expect(page.getByText('ローカル決済テストの一時エラー', { exact: true })).toBeVisible();
    await expect(page.locator('.paws-review')).toContainText('Local delivery address');
    await expect(page.locator('.paws-review')).toContainText('Local gift message');
    const first = state.requests[0];
    expect(first.submission).toMatchObject({
        planId: 'pet-single', goodsTypes: ['Tシャツ'], goodsDetails: ['L'],
        artStyle: 'other', customStyle: 'Local custom illustration', giftWrap: true,
        giftMessage: 'Local gift message', referralCode: 'LOCAL-REF', photoPublishingOptOut: true,
        customer: { name: 'Local Customer', phone: '090-0000-0000', address: 'Local delivery address', petDetail: 'Local pet details', note: 'Local customer note' },
    });
    for (const files of [first.submission.photos, first.submission.styleReferences]) {
        expect(files[0].dataUrl).toBe(`data:image/png;base64,${png.toString('base64')}`);
        expect(files[0].size).toBe(png.length);
    }
    expect(first.submission).not.toHaveProperty('amount');
    await page.getByRole('button', { name: '修正する', exact: true }).click();
    await expect(page.getByPlaceholder('東京都新宿区...', { exact: true })).toHaveValue('Local delivery address');
    await next(page);
    state.checkoutFailure = false;
    await page.getByRole('button', { name: 'お支払いに進む →', exact: true }).click();
    await expect(page).toHaveURL(checkoutUrl);
    expect(state.requests[1].requestId).toBe(first.requestId);
});

test('repeated Next clicks advance only one validated step and never reach a removed payment screen', async ({ page }) => {
    await mockCommerce(page);
    await page.goto('/pet/order?plan=pet-trial');
    await page.getByRole('button', { name: '次へ →', exact: true }).evaluate(button => {
        for (let i = 0; i < 5; i++) button.click();
    });
    await expect(page.getByRole('button', { name: '写真をアップロード', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '次へ →', exact: true })).toBeVisible();
    await page.locator('input[type=file]').setInputFiles(image('pet.png'));
    await expect(page.locator('.paws-photo-item')).toHaveCount(1);
    await page.getByRole('button', { name: '次へ →', exact: true }).evaluate(button => {
        for (let i = 0; i < 5; i++) button.click();
    });
    await expect(page.getByRole('heading', { name: 'お客様情報をお聞かせください' })).toBeVisible();
    await fillCustomer(page);
    await page.getByRole('button', { name: '次へ →', exact: true }).evaluate(button => {
        for (let i = 0; i < 5; i++) button.click();
    });
    await expect(page.getByRole('heading', { name: 'ご入力内容をご確認ください' })).toBeVisible();
    await expect(page.getByRole('button', { name: '修正する', exact: true })).toBeVisible();
});

test('invalid phone numbers stay at the customer step with a correction message', async ({ page }) => {
    const state = {};
    await mockCommerce(page, state);
    await choosePlan(page);
    await fillCustomer(page, { phone: 'abc' });
    await next(page);
    await expect(page.getByText('電話番号は8〜30文字の半角数字・記号でご記入ください。', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'お客様情報をお聞かせください' })).toBeVisible();
    expect(state.requests).toHaveLength(0);
});

test('publication coupon requires separate explicit permission and never changes the opt-out automatically', async ({ page }) => {
    const state = { checkoutFailure: true };
    await mockCommerce(page, state);
    await reachReview(page);
    await page.getByLabel('クーポンコード', { exact: true }).fill('PROMO5500');
    await page.getByRole('button', { name: '適用', exact: true }).click();
    await expect(page.locator('.paws-coupon__agree input')).toBeDisabled();
    await expect(page.locator('.paws-amount-summary__row--total')).toContainText('¥7,800');
    await page.getByRole('button', { name: 'お支払いに進む →', exact: true }).click();
    await expect(page.getByText('このクーポンには掲載可の設定と掲載許諾への同意が必要です。', { exact: true })).toBeVisible();
    expect(state.requests).toHaveLength(0);
    await page.getByRole('button', { name: '掲載設定を変更する', exact: true }).click();
    await expect(page.locator('#photo-publishing-optout')).toBeChecked();
    await page.locator('#photo-publishing-optout').uncheck();
    await next(page);
    await expect(page.locator('.paws-coupon__agree input')).not.toBeChecked();
    await page.locator('.paws-coupon__agree input').check();
    await expect(page.locator('.paws-amount-summary__row--total')).toContainText('¥5,500');
    await page.getByRole('button', { name: 'お支払いに進む →', exact: true }).click();
    await expect(page.getByText('ローカル決済テストの一時エラー', { exact: true })).toBeVisible();
    expect(state.requests[0].submission).toMatchObject({ couponCode: 'PROMO5500', couponAgreed: true, photoPublishingOptOut: false });
});

test('switching to an ineligible plan clears an applied coupon and its agreement requirement', async ({ page }) => {
    const state = { checkoutFailure: true };
    await mockCommerce(page, state);
    await reachReview(page);
    await page.getByLabel('クーポンコード', { exact: true }).fill('PROMO5500');
    await page.getByRole('button', { name: '適用', exact: true }).click();
    await page.getByRole('button', { name: '修正する', exact: true }).click();
    await page.getByRole('button', { name: '← 戻る', exact: true }).click();
    await page.getByRole('button', { name: '← 戻る', exact: true }).click();
    await page.locator('label[for="plan-pet-trial"]').click();
    await next(page); await next(page); await next(page);
    await expect(page.getByLabel('クーポンコード', { exact: true })).toHaveValue('');
    await expect(page.locator('.paws-coupon__agree')).toHaveCount(0);
    await page.getByRole('button', { name: 'お支払いに進む →', exact: true }).click();
    await expect(page.getByText('ローカル決済テストの一時エラー', { exact: true })).toBeVisible();
    expect(state.requests[0].submission).toMatchObject({ planId: 'pet-trial', couponCode: '', couponAgreed: false });
});

test('checkout return waits for persisted order confirmation after Stripe payment', async ({ page }) => {
    const state = { statuses: [{ paymentStatus: 'paid', orderStatus: 'processing' }] };
    await mockCommerce(page, state);
    await page.goto(`/pet/order?stripe=success&session_id=${sessionId}`);
    await expect(page.getByRole('status')).toContainText('ご注文の受付を確認しています');
    await expect(page.getByRole('heading', { name: 'ご注文ありがとうございました' })).toHaveCount(0);
    state.statuses = [{ paymentStatus: 'paid', orderStatus: 'confirmed' }];
    await expect(page.getByRole('heading', { name: 'ご注文ありがとうございました' })).toBeVisible();
    expect(state.statusRequests).toBeGreaterThanOrEqual(2);
});

test('refunded checkout is identified without a successful order confirmation', async ({ page }) => {
    await mockCommerce(page, { statuses: [{ paymentStatus: 'refunded', orderStatus: 'pending' }] });
    await page.goto(`/pet/order?stripe=success&session_id=${sessionId}`);
    await expect(page.getByRole('status')).toContainText('返金済み');
    await expect(page.getByRole('heading', { name: 'ご注文ありがとうございました' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '再確認する', exact: true })).toHaveCount(0);
});

test('checkout verification failure never reports a successful payment from URL parameters', async ({ page }) => {
    await mockCommerce(page, { statusFailure: true });
    await page.goto(`/pet/order?stripe=success&session_id=${sessionId}`);
    await expect(page.getByRole('alert')).toContainText('お支払い状況を確認できません');
    await expect(page.getByRole('heading', { name: 'ご注文ありがとうございました' })).toHaveCount(0);
});
