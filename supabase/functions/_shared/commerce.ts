import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.115.0';
import { HttpError } from './http.ts';
import { validateUploads } from './uploads.ts';

export const TENANT_ID = '00000000-0000-0000-0000-000000000000';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const SESSION_ID = /^cs_(test_|live_)?[a-zA-Z0-9]{16,200}$/;
const PLANS = { 'pet-trial': 0, 'pet-single': 1, 'pet-pair': 2 } as const;
const GOODS_DETAILS: Record<string, string[]> = {
    'Tシャツ': ['S', 'M', 'L', 'LL'],
    'お散歩バッグ': [''],
    'キャンバスバッグ': [''],
    'マグカップ': [''],
    'クッション': ['45cm × 45cm', '50cm × 50cm'],
    'スマホケース': ['iPhone 16 / 16 Pro', 'iPhone 15 / 15 Pro', 'iPhone 14 / 14 Pro', 'iPhone 13 / 13 Pro', 'その他（Android含む）'],
    'アクリルキーホルダー': [''],
    'その他ご相談': [''],
};

export type Upload = ReturnType<typeof validateUploads>[number];
export type SavedUpload = { path: string; name: string; type: string; size: number };
export type Submission = {
    planId: keyof typeof PLANS;
    goodsTypes: string[];
    goodsDetails: string[];
    artStyle: string;
    customStyle: string;
    giftWrap: boolean;
    giftMessage: string;
    customer: Record<'name' | 'email' | 'phone' | 'postalCode' | 'address' | 'petName' | 'petDetail' | 'note', string>;
    couponCode: string;
    couponAgreed: boolean;
    referralCode: string;
    photoPublishingOptOut: boolean;
};
export type StoredSubmission = Submission & { photos: SavedUpload[]; styleReferences: SavedUpload[] };
export type Product = { id: string; tenant_id: string; name: string; base_price: number };
export type Order = {
    id: string;
    tenant_id: string;
    product_id: string;
    customer_id: string | null;
    customer_email: string;
    amount: number;
    currency: string;
    status: string;
    payment_status: string;
    checkout_request_id: string;
    checkout_request_hash: string;
    stripe_session_id: string | null;
    checkout_url: string | null;
    created_at: string;
    form_data: StoredSubmission;
    options: { source: string; productName: string; returnOrigin: string; discountAmount: number; uploadsReady: boolean };
    asset_urls: string[];
    tier_id: string;
    selected_options: string[];
};
export type CheckoutSession = {
    id: string;
    url?: string | null;
    mode?: string | null;
    status?: string | null;
    payment_status: string;
    amount_total: number | null;
    currency: string | null;
    metadata: Record<string, string> | null;
    payment_intent?: string | { id: string } | null;
};
export type Fulfillment = {
    p_event_id: string;
    p_session_id: string;
    p_order_id: string;
    p_payment_intent: string;
    p_amount: number;
    p_currency: string;
};
export interface CommerceRepository {
    findByRequest(requestId: string): Promise<Order | null>;
    findBySession(sessionId: string): Promise<Order | null>;
    findProduct(planId: string): Promise<Product>;
    reserveFirstOrderCoupon(orderId: string): Promise<boolean>;
    insertOrder(order: Order): Promise<Order>;
    saveAssets(order: Order, photos: SavedUpload[], references: SavedUpload[]): Promise<Order>;
    saveSession(orderId: string, sessionId: string, url: string): Promise<void>;
    fulfill(input: Fulfillment): Promise<void>;
}

function record(value: unknown, field: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, `${field}をご確認ください。`);
    return value as Record<string, unknown>;
}

function text(value: unknown, field: string, max: number, required = false): string {
    if (value === undefined || value === null) value = '';
    if (typeof value !== 'string' || value.length > max) throw new HttpError(400, `${field}をご確認ください。`);
    const result = value.trim();
    if (required && !result) throw new HttpError(400, `${field}は必須です。`);
    return result;
}

function bool(value: unknown, field: string): boolean {
    if (value === undefined) return false;
    if (typeof value !== 'boolean') throw new HttpError(400, `${field}をご確認ください。`);
    return value;
}

export function validateSubmission(input: unknown): { submission: Submission; photos: Upload[]; references: Upload[] } {
    const raw = record(input, '注文内容');
    const planId = text(raw.planId, 'プラン', 30) as Submission['planId'];
    if (!Object.hasOwn(PLANS, planId)) throw new HttpError(400, 'プランを選択してください。');
    const goodsCount = PLANS[planId];
    const goodsTypes = raw.goodsTypes ?? [];
    const goodsDetails = raw.goodsDetails ?? [];
    if (!Array.isArray(goodsTypes) || !Array.isArray(goodsDetails) || goodsTypes.length > 2 || goodsDetails.length > 2) {
        throw new HttpError(400, 'グッズの選択をご確認ください。');
    }
    const selectedGoods: string[] = [];
    const selectedDetails: string[] = [];
    for (let i = 0; i < goodsCount; i++) {
        const goods = text(goodsTypes[i], 'グッズ', 50, true);
        const detail = text(goodsDetails[i], 'サイズ・機種', 100);
        if (!Object.hasOwn(GOODS_DETAILS, goods) || !GOODS_DETAILS[goods].includes(detail)) {
            throw new HttpError(400, 'グッズのサイズ・機種を選択してください。');
        }
        selectedGoods.push(goods);
        selectedDetails.push(detail);
    }
    const customer = record(raw.customer, 'お客様情報');
    const email = text(customer.email, 'メールアドレス', 254, true).toLowerCase();
    const postalCode = text(customer.postalCode, '郵便番号', 8, true);
    const phone = text(customer.phone, '電話番号', 30, true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'メールアドレスをご確認ください。');
    if (!/^\d{3}-?\d{4}$/.test(postalCode)) throw new HttpError(400, '郵便番号をご確認ください。');
    if (!/^[+\d\s()-]{8,30}$/.test(phone)) throw new HttpError(400, '電話番号をご確認ください。');
    const artStyle = text(raw.artStyle, '画風', 30, true);
    if (!['character', 'realistic', 'other'].includes(artStyle)) throw new HttpError(400, '画風をご確認ください。');
    const giftWrap = goodsCount > 0 && bool(raw.giftWrap, 'ギフト包装');
    const submission: Submission = {
        planId, goodsTypes: selectedGoods, goodsDetails: selectedDetails, artStyle,
        customStyle: text(raw.customStyle, '画風のご希望', 2000),
        giftWrap, giftMessage: giftWrap ? text(raw.giftMessage, 'ギフトメッセージ', 1000) : '',
        customer: {
            name: text(customer.name, 'お名前', 150, true), email, phone, postalCode,
            address: text(customer.address, 'ご住所', 500, true),
            petName: text(customer.petName, 'ペットのお名前', 150),
            petDetail: text(customer.petDetail, 'ペットの特徴', 3000),
            note: text(customer.note, '備考', 5000),
        },
        couponCode: text(raw.couponCode, 'クーポン', 60).toUpperCase().replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)),
        couponAgreed: bool(raw.couponAgreed, '掲載許諾'),
        referralCode: text(raw.referralCode, '紹介コード', 100),
        photoPublishingOptOut: bool(raw.photoPublishingOptOut, '写真の掲載設定'),
    };
    const photos = validateUploads(raw.photos, { maxFiles: 3, required: true });
    const references = validateUploads(raw.styleReferences, { maxFiles: 3 });
    const byteCount = [...photos, ...references].reduce((total, file) => total + file.bytes.byteLength, 0);
    if (byteCount > 20 * 1024 * 1024) throw new HttpError(413, '写真と参考画像は合計20MB以内にしてください。');
    return { submission, photos, references };
}

export function calculatePrice(submission: Submission, basePrice: number): { amount: number; discountAmount: number } {
    if (!Number.isSafeInteger(basePrice) || basePrice < 50 || basePrice > 1_000_000) throw new HttpError(503, 'プラン料金の確認が必要です。');
    let discountAmount = 0;
    switch (submission.couponCode) {
        case '': break;
        case 'はつもふ10': discountAmount = Math.floor(basePrice * 0.1); break;
        case 'PROMO5500':
            if (submission.planId !== 'pet-single' || !submission.couponAgreed || submission.photoPublishingOptOut) throw new HttpError(400, 'このクーポンには対象プランと掲載許諾への同意が必要です。掲載不可との併用はできません。');
            discountAmount = Math.max(0, basePrice - 5500);
            break;
        case 'NMとくべつ': {
            const price = { 'pet-trial': 3000, 'pet-single': 5500, 'pet-pair': 8500 }[submission.planId];
            discountAmount = Math.max(0, basePrice - price);
            break;
        }
        default: throw new HttpError(400, 'クーポンコードが無効です。');
    }
    return { amount: basePrice - discountAmount + (submission.giftWrap ? 3300 : 0), discountAmount };
}

export async function submissionFingerprint(submission: Submission, photos: Upload[], references: Upload[]): Promise<string> {
    const digest = async (bytes: Uint8Array) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes)))).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    const describe = async (files: Upload[]) => Promise.all(files.map(async (file) => ({ name: file.name, type: file.type, hash: await digest(file.bytes) })));
    return digest(new TextEncoder().encode(JSON.stringify({ submission, photos: await describe(photos), references: await describe(references) })));
}

export function assertMatchingSession(order: Order, session: CheckoutSession): void {
    if (session.id !== order.stripe_session_id || session.mode !== 'payment' ||
        session.metadata?.order_id !== order.id || session.metadata?.tenant_id !== order.tenant_id ||
        session.metadata?.product_id !== order.product_id || session.amount_total !== order.amount ||
        session.currency !== order.currency) {
        throw new HttpError(409, '決済情報と注文情報が一致しません。サポートへお問い合わせください。');
    }
}

const ORDER_FIELDS = 'id,tenant_id,product_id,customer_id,customer_email,amount,currency,status,payment_status,checkout_request_id,checkout_request_hash,stripe_session_id,checkout_url,created_at,form_data,options,asset_urls,tier_id,selected_options';
function databaseFailure(error: unknown): never {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown';
    console.error('Commerce persistence failed', { code });
    throw new HttpError(503, '注文情報を保存・確認できませんでした。時間をおいて再度お試しください。');
}

export function commerceRepository(db: SupabaseClient): CommerceRepository {
    const find = async (field: string, value: string): Promise<Order | null> => {
        const { data, error } = await db.from('orders').select(ORDER_FIELDS).eq(field, value).maybeSingle();
        if (error) databaseFailure(error);
        return data as Order | null;
    };
    return {
        findByRequest: (id) => find('checkout_request_id', id),
        findBySession: (id) => find('stripe_session_id', id),
        async findProduct(planId) {
            const { data, error } = await db.from('products').select('id,tenant_id,name,base_price')
                .eq('tenant_id', TENANT_ID).eq('active', true).eq('metadata->>plan_id', planId).single();
            if (error || !data) databaseFailure(error);
            return data as Product;
        },
        async reserveFirstOrderCoupon(orderId) {
            const { data, error } = await db.rpc('reserve_first_order_coupon', { p_order_id: orderId });
            if (error) databaseFailure(error);
            if (typeof data !== 'boolean') databaseFailure('Invalid coupon reservation response');
            return data;
        },
        async insertOrder(order) {
            const { data, error } = await db.from('orders').insert(order).select(ORDER_FIELDS).single();
            if (error?.code === '23505') {
                const existing = await find('checkout_request_id', order.checkout_request_id);
                if (existing) return existing;
            }
            if (error || !data) databaseFailure(error);
            return data as Order;
        },
        async saveAssets(order, photos, references) {
            const update = {
                form_data: { ...order.form_data, photos, styleReferences: references },
                asset_urls: [...photos, ...references].map((file) => file.path),
                options: { ...order.options, uploadsReady: true },
            };
            const { data, error } = await db.from('orders').update(update).eq('id', order.id)
                .eq('checkout_request_hash', order.checkout_request_hash).eq('options->>uploadsReady', 'false')
                .is('stripe_session_id', null).select(ORDER_FIELDS).maybeSingle();
            if (error) databaseFailure(error);
            if (data) return data as Order;
            const existing = await find('checkout_request_id', order.checkout_request_id);
            if (!existing?.options.uploadsReady) databaseFailure('Order changed during asset persistence');
            return existing;
        },
        async saveSession(orderId, sessionId, url) {
            const { data, error } = await db.from('orders').update({ stripe_session_id: sessionId, checkout_url: url })
                .eq('id', orderId).is('stripe_session_id', null).select('id').maybeSingle();
            if (error) databaseFailure(error);
            if (!data) {
                const existing = await find('stripe_session_id', sessionId);
                if (existing?.id !== orderId) databaseFailure('Checkout association changed');
            }
        },
        async fulfill(input) {
            const { data, error } = await db.rpc('fulfill_checkout', input);
            if (error || !data) databaseFailure(error);
        },
    };
}
