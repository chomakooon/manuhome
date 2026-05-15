/**
 * ====================================================================
 * 【記入ガイド】数字で見るカタチ便 (site-stats.config.js)
 * ====================================================================
 * HomePage の StatsSection が読みます。viewport に入るとカウントアップ
 * アニメーションが発火します（useCountUp）。
 *
 * ── フィールド説明 ──
 *   id     [必須] 一意な識別子（"projects" など、英数字）
 *   value  [必須] 数値文字列。先頭の数値部分のみアニメーション対象
 *                "100+" "70" "3" のように記述可能
 *   unit   [必須] 数値直後の単位（"件" "%" "日" "種類" など）
 *   label  [必須] 数値の意味（例 "制作実績"）
 *   note   [任意] 補足注釈 1 行。なければプロパティごと省略可
 *
 * ── 重要 ──
 *   実数を超える誇張は信頼を損ねます。控えめな実数で OK。
 *   実績がまだ少なければセクションごと非表示にすることも可能（HomePage.jsx から
 *   <StatsSection /> をコメントアウト）。
 *
 * ── 記入例 ──
 *   { id: 'avg-rating', value: '4.8', unit: '/5', label: '満足度', note: '納品後アンケート平均' }
 * ====================================================================
 *
 * @file src/config/site-stats.config.js
 */

/**
 * @typedef {Object} SiteStat
 * @property {string} id
 * @property {string} value  - 例: "100+"
 * @property {string} unit   - 例: "件"
 * @property {string} label  - 例: "制作実績"
 * @property {string} [note] - 任意の補足
 */

/** @type {SiteStat[]} */
export const SITE_STATS = [
    // ⚠️ 以下は全てサンプル。実数値に置き換えてください（誇張せず正直な値で）。
    {
        id: 'projects',
        value: '100+', // ← サンプル、要差し替え
        unit: '件',
        label: '制作実績',
        note: '個人・法人問わず幅広く対応',
    },
    {
        id: 'categories',
        value: '8',
        unit: '種類',
        label: '対応カテゴリ',
        note: 'ペット・名刺・漫画・キャラ ほか',
    },
    {
        id: 'repeat',
        value: '70',
        unit: '%',
        label: 'リピート率',
        note: '継続してご依頼いただける安心感',
    },
    {
        id: 'leadtime',
        value: '3',
        unit: '日',
        label: '最短納期',
        note: 'お急ぎ案件もまずはご相談ください',
    },
];
