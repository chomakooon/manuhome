/**
 * @file src/sites/kataribin/pages/index.js
 *
 * 既存 src/pages/* 配下の「かたち便」サイト用ページを、このディレクトリから
 * 再エクスポートする facade。物理的なファイル移動は行わず import 経路だけを整理する。
 *
 * 目的:
 *   - 将来的に kataribin/pages/ 配下へファイルを実体ごと移動する際、
 *     ここの相対パスだけを書き換えれば呼び出し側を破壊しない。
 *   - 「kataribin に属するページの正規入口」をこのファイルで一覧化する。
 *
 * 注意:
 *   - 現時点で App.jsx は引き続き src/pages/* を直接 import している
 *     （段階的移行のため、この facade は使用待機状態）。
 *   - PetPage は将来 もふらぼ 側で再実装される予定のため、
 *     pawspress 側のページが揃ったらここから外す。
 */

export { default as TopPage } from '../../../pages/public/TopPage';
export { default as ServicesPage } from '../../../pages/public/ServicesPage';
export { default as PetPage } from '../../../pages/public/PetPage';
export { default as NetworkingPage } from '../../../pages/public/NetworkingPage';
export { default as AboutPage } from '../../../pages/public/AboutPage';
export { default as LinksPage } from '../../../pages/public/LinksPage';
export { default as IntakePage } from '../../../pages/public/IntakePage';
export { default as DiagnosticPage } from '../../../pages/public/DiagnosticPage';
export { default as PortfolioPage } from '../../../pages/public/PortfolioPage';
export { default as PortfolioSubCategoryPage } from '../../../pages/public/PortfolioSubCategoryPage';
export { default as OrderPage } from '../../../pages/public/OrderPage';
export { default as ThanksPage } from '../../../pages/client/ThanksPage';
export { default as OrderFlowPage } from '../../../pages/order/OrderFlowPage';
export { default as OrderSuccessPage } from '../../../pages/order/OrderSuccessPage';
