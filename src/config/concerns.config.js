/**
 * @file src/config/concerns.config.js
 *
 * HomePage「こんなお悩み、ありませんか？」セクションのデータ（Phase 19）。
 * 訪問者の心のセリフを 6 件並べることで、自己関連性と共感を生み、
 * 続く「5 つの強み」セクションでの解決提示へ滑らかに繋ぐ。
 *
 * 編集ルール:
 *   - icon は絵文字（emoji）を直接記述。lucide-react は使用しない（軽量化）
 *   - text は 30 字前後の一人称セリフ
 *   - 並び順は配列順（3x2 グリッド、左→右→下）
 *
 * TODO(運用): 岡崎さんが顧客実例に基づいて文言を磨いてください。
 */

/**
 * @typedef {Object} Concern
 * @property {number} id
 * @property {string} icon  - emoji 1 文字
 * @property {string} text  - 一人称の悩み
 */

/** @type {Concern[]} */
export const CONCERNS = [
    {
        id: 1,
        icon: '💬',
        text: '自分のサービスをどう伝えればいいか分からない',
    },
    {
        id: 2,
        icon: '📉',
        text: 'SNS や HP を見られても、問い合わせに繋がらない',
    },
    {
        id: 3,
        icon: '🎨',
        text: 'ロゴや名刺はあるけど、全体にまとまりがない',
    },
    {
        id: 4,
        icon: '🔍',
        text: '他の人と差別化できていない',
    },
    {
        id: 5,
        icon: '😟',
        text: '価格で比べられて消耗している',
    },
    {
        id: 6,
        icon: '💡',
        text: '世界観を伝えたいけど、誰に頼めばいいか分からない',
    },
];
