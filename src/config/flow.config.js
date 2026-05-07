/**
 * @file src/config/flow.config.js
 *
 * /flow ページに表示する制作フロー（ステップ）の定義。
 * FlowPage / FlowSteps はこのファイルだけを参照する想定。
 *
 * @see ./_schema.js  (FlowStep の型定義)
 *
 * 編集ルール:
 *   - 表示順は order 昇順
 *   - icon は lucide-react のアイコン名（例: 'MessageCircle'）
 *   - duration は任意。納期が変動する場合は範囲表記でよい
 *
 * TODO(step3-data): 制作フローのステップを配列で投入する
 *   - お問い合わせ → ヒアリング → 見積 → 制作 → 納品 の最低5ステップ程度を想定
 *   - 既存 IntakePage / OrderPage で表現されているフローと矛盾が無いように
 */

/** @type {import('./_schema.js').FlowStep[]} */
export const flowSteps = [];
