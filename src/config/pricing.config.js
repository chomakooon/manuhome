/**
 * @file src/config/pricing.config.js
 *
 * /pricing ページに表示する料金プラン一覧。
 * PricingPage / PricingTable / PricingCard はこのファイルだけを参照する想定。
 *
 * @see ./_schema.js  (PricingPlan の型定義)
 *
 * 編集ルール:
 *   - 1プラン = 配列の1要素
 *   - id はサイト内で一意に保つ（CTA の query string で利用予定: /contact?plan=<id>）
 *   - category は works/categories.js の id と揃える（フィルタ連携の前提）
 *
 * TODO(step3-data): 実際の料金プランを配列で投入する
 *   - 既存 ServicesPage / IntakePage の BUDGET_OPTIONS と整合性を取る
 *   - 「人気」バッジを付けるプランを popular: true でマーク
 *   - 各プランの cta.to を /contact?plan=<id> に統一する
 */

/** @type {import('./_schema.js').PricingPlan[]} */
export const pricingPlans = [];
