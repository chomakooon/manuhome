/**
 * @file src/config/contact.config.js
 *
 * /contact ページの設定（送信先・件名テンプレ・必須項目）。
 * ContactPage / ContactForm はこのファイルだけを参照する想定。
 * 実際の送信ロジックは src/lib/contact.js（後続ステップで作成）に委譲する。
 *
 * @see ./_schema.js  (ContactConfig / ContactField の型定義)
 *
 * 編集ルール:
 *   - endpoint は VITE_CONTACT_ENDPOINT で上書きされるため、ここはデフォルト値
 *   - fields の name は Cloudflare Worker 側のキーと一致させる
 *   - intakeLink で /intake への「詳しく相談」導線を維持する（案C採用方針）
 *
 * TODO(step3-data): ContactConfig を満たす実データを投入する
 *   - endpoint: ステップ4で立てる Cloudflare Worker の URL
 *   - subjectTemplate: 例 "[manuhome] {name} 様からの問い合わせ"
 *   - fields: name / email / message を最小構成で
 *   - intakeLink.to: '/intake'
 */

/** @type {import('./_schema.js').ContactConfig | null} */
export const contactConfig = null;
