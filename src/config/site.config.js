/**
 * @file src/config/site.config.js
 *
 * サイト全体に関わる設定（サイト名・ナビ・SNS・フッター等）。
 * Header / Footer などのレイアウトコンポーネントはこのファイルだけを参照する想定。
 *
 * @see ./_schema.js  (SiteConfig / NavItem の型定義)
 *
 * 編集ルール:
 *   - 表示文言・URL の変更はここで完結させる
 *   - 新しいページを追加した場合は nav にも反映させる（必要なら）
 *
 * TODO(step3): SiteConfig を満たす実データを投入する
 *   - siteKey: テンプレ販売時にテナントごとに変える識別子
 *   - nav: ステップ3でルーティング案C採用後の最終構成を反映
 *   - headerCta: 既存の "制作相談" → /contact に向けるか要確認
 *   - social / footerCopyright: 既存 Footer.jsx から移植
 */

/** @type {import('./_schema.js').SiteConfig | null} */
export const siteConfig = null;
