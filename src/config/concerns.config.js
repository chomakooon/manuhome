/**
 * ====================================================================
 * 【記入ガイド】こんなお悩み、ありませんか？ (concerns.config.js)
 * ====================================================================
 * HomePage の ConcernsSection が読みます。
 * 「訪問者の心のセリフ」を並べて共感を獲得 → 自己関連性を高めるパートです。
 *
 * ── フィールド説明 ──
 *   id       [必須] 一意な数値
 *   iconName [必須] lucide-react アイコン名（KataribinHomePage の CONCERN_ICONS に対応）
 *   text     [必須] 一人称のセリフ。30 字前後が読みやすい
 *
 * ── 推奨件数 ──
 *   6 件（3x2 グリッド）。実顧客の声を集める前は現状サンプルでも実害なし、
 *   公開後にお問い合わせ DM などから出た言葉に置き換えると効果が高まります。
 *
 * ── 記入例 ──
 *   { id: 7, iconName: 'HelpCircle', text: '何から手をつければいいか分からない' }
 * ====================================================================
 *
 * @file src/config/concerns.config.js
 */

/**
 * @typedef {Object} Concern
 * @property {number} id
 * @property {string} iconName  - lucide-react アイコン名
 * @property {string} text      - 一人称の悩み
 */

/** @type {Concern[]} */
export const CONCERNS = [
    {
        id: 1,
        iconName: 'MessageCircle',
        text: '自分のサービスをどう伝えればいいか分からない',
    },
    {
        id: 2,
        iconName: 'TrendingDown',
        text: 'SNS や HP を見られても、問い合わせに繋がらない',
    },
    {
        id: 3,
        iconName: 'Palette',
        text: 'ロゴや名刺はあるけど、全体にまとまりがない',
    },
    {
        id: 4,
        iconName: 'Search',
        text: '他の人と差別化できていない',
    },
    {
        id: 5,
        iconName: 'Frown',
        text: '価格で比べられて消耗している',
    },
    {
        id: 6,
        iconName: 'Lightbulb',
        text: '世界観を伝えたいけど、誰に頼めばいいか分からない',
    },
];
