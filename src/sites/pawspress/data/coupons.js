/**
 * @file src/sites/pawspress/data/coupons.js
 *
 * もふらぼ 注文ページで使える割引クーポンの定義。
 * 入力 UI は /pet/order の Step 4 (確認画面) にある。
 *
 * 編集ルール:
 *   - code はサイト内で一意。比較は大文字に正規化する (findCoupon 内)
 *   - type
 *     'percentage'    : 基本料金 (selectedPlan.price) に対する % OFF
 *     'fixed-total'   : 基本料金を value 円固定に置き換える
 *     'fixed-by-plan' : 基本料金を pricesByPlan[planId] 円に置き換える (プラン別固定価格)
 *   - applicablePlans
 *     null      : 全プラン対象
 *     string[]  : 指定 planId のみ (例: ['pet-single'])
 *   - requiresAgreement: true の場合、Step4 で同意チェックを必須にする
 *
 * 追加の運用クーポンは下の配列に append するだけで OK。
 */

/**
 * @typedef {Object} Coupon
 * @property {string} code
 * @property {string} name
 * @property {string} description
 * @property {'percentage' | 'fixed-total' | 'fixed-by-plan'} type
 * @property {number} [value]                       - percentage / fixed-total 用
 * @property {Record<string, number>} [pricesByPlan] - fixed-by-plan 用
 * @property {string[] | null} applicablePlans
 * @property {boolean} requiresAgreement
 * @property {string} [agreementText]
 */

/** @type {Coupon[]} */
export const COUPONS = [
    {
        code: 'はつもふ10',
        name: '友だち追加クーポン',
        description: 'LINE 友だち追加で 10% OFF（全プラン対象・初回ご注文）',
        type: 'percentage',
        value: 10,
        applicablePlans: null,
        requiresAgreement: false,
    },
    {
        code: 'PROMO5500',
        name: 'SNS掲載特典クーポン',
        description:
            'Single Item プランを ¥5,500 でご提供。完成イラストを公式 SNS / HP に制作実例として掲載させていただく特典プランです。',
        type: 'fixed-total',
        value: 5500,
        applicablePlans: ['pet-single'],
        requiresAgreement: true,
        agreementText:
            '完成した作品（イラスト・グッズ写真）を、もふらぼ公式 Instagram および公式 HP に制作実例として掲載することに同意します。',
    },
    {
        code: 'NMとくべつ',
        name: 'NMとくべつクーポン',
        description:
            '関係者向け特別価格。データのみ ¥3,000 / グッズ1点 ¥5,500 / グッズ2点 ¥8,500',
        type: 'fixed-by-plan',
        pricesByPlan: {
            'pet-trial': 3000,
            'pet-single': 5500,
            'pet-pair': 8500,
        },
        applicablePlans: ['pet-trial', 'pet-single', 'pet-pair'],
        requiresAgreement: false,
    },
];

/**
 * コード文字列の正規化:
 *   - 前後空白除去
 *   - 英字を大文字化 (英字コード用)
 *   - 全角数字 (０〜９) → 半角数字 (0〜9) に統一 (はつもふ１０ も はつもふ10 とマッチ)
 */
const normalizeCode = (raw) =>
    raw
        .trim()
        .toUpperCase()
        .replace(/[０-９]/g, (ch) =>
            String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
        );

/** コード文字列からクーポンを検索 */
export const findCoupon = (code) => {
    if (!code) return null;
    const normalized = normalizeCode(code);
    return COUPONS.find((c) => normalizeCode(c.code) === normalized) ?? null;
};

/** クーポンが指定プランに適用可能か */
export const isCouponApplicable = (coupon, planId) => {
    if (!coupon) return false;
    if (!coupon.applicablePlans) return true;
    return coupon.applicablePlans.includes(planId);
};

/**
 * 基本料金に対する割引額を計算 (常に正の整数を返す)。
 * 合計金額 = base + giftWrap - discount。
 * fixed-total / fixed-by-plan は「base が固定価格を超える時のみ差額を割引額とする」設計。
 *
 * @param {object} coupon
 * @param {number} base       - 基本料金 (selectedPlan.price)
 * @param {string} [planId]   - fixed-by-plan 用に必要
 */
export const computeDiscount = (coupon, base, planId) => {
    if (!coupon || !base) return 0;
    if (coupon.type === 'percentage') {
        return Math.floor(base * (coupon.value / 100));
    }
    if (coupon.type === 'fixed-total') {
        return Math.max(0, base - coupon.value);
    }
    if (coupon.type === 'fixed-by-plan') {
        const target = coupon.pricesByPlan?.[planId];
        if (typeof target !== 'number') return 0;
        return Math.max(0, base - target);
    }
    return 0;
};
