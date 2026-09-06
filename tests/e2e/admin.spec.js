import { test, expect as baseExpect } from '@playwright/test';

// Supabase retries temporary 5xx responses before returning the final error.
const expect = baseExpect.configure({ timeout: 15000 });
import { Buffer } from 'node:buffer';

const user = { id: '11111111-1111-4111-8111-111111111111', email: 'admin@example.invalid', role: 'authenticated', aud: 'authenticated' };
const order = {
    id: '22222222-2222-4222-8222-222222222222', customer_name: 'Local Admin Fixture', customer_email: user.email,
    created_at: '2026-01-01T00:00:00Z', status: 'paid', payment_status: 'paid', order_internal_notes: { notes: 'original note' }, amount: 6000,
    form_data: {
        planId: 'pet-single',
        customer: { name: 'Local Admin Fixture', phone: '09000000000', postalCode: '0000000', address: 'LOCAL TEST ADDRESS', petName: 'LOCAL PET', petDetail: 'LOCAL PET DETAILS', note: 'LOCAL CUSTOMER NOTE' },
        photos: [], styleReferences: [], giftWrap: true, giftMessage: 'LOCAL GIFT MESSAGE', photoPublishingOptOut: true,
    },
};
const contact = {
    id: '33333333-3333-4333-8333-333333333333', source: 'intake', name: 'Local inquiry', email: user.email,
    message: 'Local inquiry message', status: 'new', metadata: { inquiryType: 'other' },
    notification_status: 'failed', created_at: '2026-01-01T00:00:00Z',
};

async function mockAdminBackend(page, state = {}) {
    const encode = object => Buffer.from(JSON.stringify(object)).toString('base64url');
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, exp: expiresAt, role: 'authenticated' })}.local-test`;
    await page.addInitScript(session => localStorage.setItem('sb-local-audit-auth-token', JSON.stringify(session)), {
        access_token: token, refresh_token: 'local-test-only', expires_at: expiresAt, expires_in: 3600, token_type: 'bearer', user,
    });
    await page.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.hostname.endsWith('.supabase.co')) {
            if (url.pathname.endsWith('/profiles')) return route.fulfill({ json: { id: user.id, role: 'creator' } });
            if (url.pathname.endsWith('/retry-contact-notification')) {
                state.notificationRequest = request.postDataJSON();
                return route.fulfill({
                    status: state.notificationFailure ? 502 : 200,
                    json: state.notificationFailure ? { error: 'Local notification failure' } : { ok: true, notificationStatus: 'sent' },
                });
            }
            if (url.pathname.endsWith('/order_internal_notes')) {
                state.lastNotes = request.postDataJSON();
                return route.fulfill({
                    status: state.updateFailure || state.notesFailure ? 500 : 200,
                    json: state.updateFailure || state.notesFailure ? { message: 'Local notes failure' } : { notes: state.lastNotes.notes },
                });
            }
            if (url.pathname.endsWith('/orders') || url.pathname.endsWith('/contacts')) {
                const fixture = url.pathname.endsWith('/orders') ? order : contact;
                if (request.method() === 'PATCH') {
                    state.lastPatch = request.postDataJSON();
                    if (url.pathname.endsWith('/orders')) {
                        state.orderPatches ??= [];
                        state.orderPatches.push(state.lastPatch);
                    }
                    return route.fulfill({
                        status: state.updateFailure ? 500 : 200,
                        json: state.updateFailure ? { message: 'Local update failure' } : { ...fixture, ...state.lastPatch },
                    });
                }
                if (state.readFailure) return route.fulfill({ status: 503, json: { message: 'Local read failure' } });
                return route.fulfill({ json: url.searchParams.has('id') ? fixture : [fixture], headers: { 'content-range': '0-0/1' } });
            }
            return route.fulfill({ status: 400, json: { message: 'Unexpected local test endpoint' } });
        }
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort();
        return route.continue();
    });
}

test('dashboard read failures hide misleading totals and retry restores metrics', async ({ page }) => {
    const state = { readFailure: true };
    await mockAdminBackend(page, state);
    await page.goto('/admin');
    await expect(page.getByRole('alert')).toContainText('ダッシュボードの読み込みに失敗');
    await expect(page.locator('.admin-stats-grid')).toHaveCount(0);
    state.readFailure = false;
    await page.getByRole('button', { name: '再読み込み', exact: true }).click();
    await expect(page.locator('.admin-stats-grid')).toBeVisible();
});

test('orders list separates read errors from empty results and retries', async ({ page }) => {
    const state = { readFailure: true };
    await mockAdminBackend(page, state);
    await page.goto('/admin/orders');
    await expect(page.getByRole('alert')).toContainText('注文の読み込みに失敗');
    state.readFailure = false;
    await page.getByRole('button', { name: '再読み込み', exact: true }).click();
    await expect(page.getByText('Local Admin Fixture', { exact: true })).toBeVisible();
});

test('paid order details preserve payment status and failed notes save keeps edits for retry', async ({ page }) => {
    const state = { updateFailure: true };
    await mockAdminBackend(page, state);
    await page.goto(`/admin/orders/${order.id}`);
    await expect(page.locator('#admin-order-status')).toHaveValue('paid');
    for (const value of ['LOCAL TEST ADDRESS', 'LOCAL PET DETAILS', 'LOCAL GIFT MESSAGE', '掲載不可', '支払済み']) {
        await expect(page.locator('body')).toContainText(value);
    }
    await page.locator('#admin-order-notes').fill('updated note');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('alert')).toContainText('保存に失敗');
    await expect(page.locator('#admin-order-notes')).toHaveValue('updated note');
    expect(state.lastPatch).toBeUndefined();
    expect(state.lastNotes).toMatchObject({ order_id: order.id, notes: 'updated note' });
    state.updateFailure = false;
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('status')).toContainText('変更を保存');
});

test('contact read, status update and notification failures stay recoverable without losing the saved record', async ({ page }) => {
    const state = { readFailure: true, updateFailure: true, notificationFailure: true };
    await mockAdminBackend(page, state);
    await page.goto('/admin/contacts');
    await expect(page.getByRole('alert')).toContainText('お問い合わせの読み込みに失敗');
    state.readFailure = false;
    await page.getByRole('button', { name: '再読み込み', exact: true }).click();
    await expect(page.getByText('Local inquiry', { exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('問い合わせは保存済み');
    await page.getByLabel('Local inquiryのステータス').selectOption('read');
    await expect(page.getByRole('alert')).toContainText('ステータスを保存できません');
    await expect(page.getByLabel('Local inquiryのステータス')).toHaveValue('new');
    state.updateFailure = false;
    await page.getByLabel('Local inquiryのステータス').selectOption('read');
    await expect(page.getByLabel('Local inquiryのステータス')).toHaveValue('read');
    await page.getByRole('button', { name: '外部通知を再送' }).click();
    await expect(page.getByRole('alert')).toContainText('外部通知を送信できません');
    await expect(page.getByText('Local inquiry', { exact: true })).toBeVisible();
    state.notificationFailure = false;
    await page.getByRole('button', { name: '外部通知を再送' }).click();
    await expect(page.getByRole('status')).toContainText('外部通知を送信済み');
    expect(state.notificationRequest).toEqual({ id: contact.id });
});

test('a notes failure after workflow save reports the partial result and retry does not repeat the status change', async ({ page }) => {
    const state = { notesFailure: true };
    await mockAdminBackend(page, state);
    await page.goto(`/admin/orders/${order.id}`);
    await page.locator('#admin-order-status').selectOption('in_progress');
    await page.locator('#admin-order-notes').fill('retained private note');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('alert')).toContainText('ステータスは保存済みですが、メモの保存に失敗');
    await expect(page.locator('#admin-order-status')).toHaveValue('in_progress');
    await expect(page.locator('#admin-order-notes')).toHaveValue('retained private note');
    state.notesFailure = false;
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('status')).toContainText('変更を保存');
    expect(state.orderPatches).toEqual([{ status: 'in_progress' }]);
});
