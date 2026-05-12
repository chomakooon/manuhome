/**
 * @file src/config/site-stats.config.js
 *
 * HomePage「数字で見るカタチ便」セクションで表示する実績数値の単一ソース。
 *
 * 編集ルール:
 *   - 数値は string 型で保持（"100+" のような表記を許容するため）
 *   - unit は数値直後の単位（件 / 種類 / % / 日 など）
 *   - label は数値の意味、note は補足注釈（任意）
 *   - 並び順は配列順
 *
 * TODO(運用): 岡崎さんが実際の実績値に更新してください。現状はプレースホルダ。
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
    {
        id: 'projects',
        value: '100+',
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
