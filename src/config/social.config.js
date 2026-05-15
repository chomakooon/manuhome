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
    x: 'https://twitter.com/',            // ← サンプル、要差し替え（実 X URL）
    instagram: 'https://instagram.com/',  // ← サンプル、要差し替え（実 Instagram URL）
    threads: 'https://threads.net/',      // ← サンプル、要差し替え（実 Threads URL）
};
