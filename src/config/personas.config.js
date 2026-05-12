/**
 * @file src/config/personas.config.js
 *
 * HomePage「こんな方におすすめです」セクションで表示する
 * ペルソナ別ユースケースの単一ソース。
 *
 * 編集ルール:
 *   - icon は lucide-react のコンポーネント名（文字列）
 *     HomePage 側の PERSONA_ICONS マップに登録されているもののみ可
 *     新しいアイコンを使う際は HomePage の import / マップ両方に追記
 *   - problem は「ユーザーの心のセリフ」を一人称で書く（共感獲得が目的）
 *   - solution は「カタチ便ができること」を端的に
 *   - ctaLink は実在するルートを指す（Phase 6 でアンカー id は削除済み）
 *   - 並び順は配列順
 *
 * TODO(運用): 岡崎さんが実際の顧客像に合わせて文言を磨いてください。
 */

/**
 * @typedef {Object} Persona
 * @property {string} id
 * @property {string} icon              - lucide-react component name
 * @property {string} title
 * @property {string} problem           - 一人称の困りごと
 * @property {string} solution          - 解決策の提案
 * @property {string} recommendedPlan   - 推奨プラン名
 * @property {string} ctaLink           - 遷移先ルート
 * @property {string} ctaText           - ボタンラベル
 */

/** @type {Persona[]} */
export const PERSONAS = [
    {
        id: 'freelancer',
        icon: 'Briefcase',
        title: '個人事業主・フリーランス',
        problem: '自分のサービスの世界観を伝えるビジュアルが欲しい',
        solution: 'ロゴ・キャラクター・名刺デザインで、一貫したブランディングをお手伝いします。',
        recommendedPlan: '名刺 Portrait / キャラクターデザイン',
        ctaLink: '/pricing',
        ctaText: '名刺・キャラのプランを見る →',
    },
    {
        id: 'restaurant',
        icon: 'Utensils',
        title: '飲食店・小規模店舗オーナー',
        problem: 'メニュー紹介や販促を、漫画で楽しく伝えたい',
        solution: '4コマ漫画でメニュー紹介、LP 漫画で集客力アップにつなげます。',
        recommendedPlan: 'Single 4コマ / Monthly Pack',
        ctaLink: '/pricing',
        ctaText: '漫画プランを見る →',
    },
    {
        id: 'pet-owner',
        icon: 'Heart',
        title: 'ペットオーナー',
        problem: 'うちの子の写真を、オリジナルグッズにしたい',
        solution: 'ペット写真をイラスト化し、フレーム・グッズに展開できます。',
        recommendedPlan: 'PAWS PRESS Pair Set（推奨）',
        ctaLink: '/pet',
        ctaText: 'PAWS PRESS を見る →',
    },
    {
        id: 'business',
        icon: 'Building2',
        title: '企業・サービス事業者',
        problem: 'サービス説明を、漫画やキャラで分かりやすくしたい',
        solution: 'LP 漫画・キャラクターデザイン・マスコット制作で、認知から理解までを支援します。',
        recommendedPlan: '1ページ漫画 / キャラクターデザイン',
        ctaLink: '/pricing',
        ctaText: '法人向けプランを見る →',
    },
];
