/**
 * ====================================================================
 * 【記入ガイド】SNS リンク (social.config.js)
 * ====================================================================
 * 全 SNS / ソーシャルリンクの単一ソース。ContactPage / Links 等から参照されます。
 *
 * ⚠️ 公開前に **必ず** 実 URL に差し替えてください。現状はトップページ URL
 *    のプレースホルダで、クリックすると無関係なページに飛びます。
 *
 * ── フィールド説明 ──
 *   key  [必須] サービス識別子（x / instagram / threads など）
 *   URL  [必須] フルパス（https:// 含む）
 *
 * 表示ラベル（"X (Twitter)" 等）は利用側コンポーネントで定義しているため、
 * このファイルでは URL のみ管理します。
 *
 * ── 関連箇所 ──
 *   - seo.config.js の ORG_JSON_LD.sameAs にも同じ URL を追加すると、
 *     検索エンジンが SNS と紐付けて表示します
 * ====================================================================
 *
 * @file src/config/social.config.js
 */

/** @type {Record<string, string>} */
export const SNS_LINKS = {
    x: 'https://x.com/mofu_labo_',
    instagram: 'https://www.instagram.com/mofumofu_labo',
    line: 'https://lin.ee/58UAkhy',        // もふらぼ公式 LINE（友だち追加で10%OFFクーポン）
    threads: 'https://threads.net/',      // ← サンプル、要差し替え（実 Threads URL）
};

/**
 * LINE 友だち追加クーポンの訴求コピー（複数箇所で使うため共通化）
 */
export const LINE_COUPON = {
    label: 'LINE友だち追加で10%OFFクーポン',
    short: '10%OFFクーポン進呈',
    qr: '/sns/line-qr.png',
    url: 'https://lin.ee/58UAkhy',
};
