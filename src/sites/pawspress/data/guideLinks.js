/**
 * @file src/sites/pawspress/data/guideLinks.js
 *
 * ヘッダーの「ご利用ガイド ▼」ドロップダウン項目と、対応する各ガイドページの
 * ルート定義の単一ソース。PawsPressLayout（ドロップダウン）と App.jsx（ルート）、
 * PawsPressGuidePage（タイトル解決）が共通参照する。
 *
 * 各ページは現状「準備中」プレースホルダ。実コンテンツは順次差し替える。
 */

export const GUIDE_LINKS = [
    { label: 'ご注文の流れ', to: '/pet/guide/order-flow' },
    { label: 'お写真の選び方', to: '/pet/guide/photo-tips' },
    { label: 'デザイン確認について', to: '/pet/guide/design-check' },
    { label: '修正対応について', to: '/pet/guide/revisions' },
    { label: 'お支払い方法', to: '/pet/guide/payment' },
    { label: '配送・送料', to: '/pet/guide/shipping' },
    { label: 'よくある質問', to: '/pet/faq' },
    { label: '法人のお客様', to: '/pet/business' },
];

/** pathname から該当ガイドのラベルを引く（PawsPressGuidePage 用） */
export const findGuideLabel = (pathname) =>
    GUIDE_LINKS.find((g) => g.to === pathname)?.label ?? 'ご利用ガイド';
