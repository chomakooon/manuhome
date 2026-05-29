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
 *   - solution は「カタチラボができること」を端的に
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
 * @property {string} image             - カード上部の代表作画像 (public/ 配下絶対パス、16:9 推奨)
 * @property {string} imageAlt          - 画像 alt
 */

/** @type {Persona[]} */
export const PERSONAS = [
    // Phase 19: 二刀流戦略のトーン調整。
    //   - 個人事業主 / ペットオーナー: 親しみ重視
    //   - 飲食店: 共感重視
    //   - 企業: 経営価値重視（指名買い・成約率・採用力）
    {
        id: 'freelancer',
        icon: 'Briefcase',
        title: '個人事業主・フリーランス',
        problem: '世界観で「選ばれる存在」になりたい',
        solution:
            'ロゴ・キャラクター・名刺を一貫した世界観で設計し、価格ではなく「あなた」で選ばれる状態を作ります。',
        recommendedPlan: '名刺 Portrait / キャラクターデザイン',
        ctaLink: '/pricing',
        ctaText: '名刺・キャラのプランを見る →',
        image: '/works/character-1.jpg',
        imageAlt: '個人事業主向け：キャラクターデザイン制作例',
    },
    {
        id: 'restaurant',
        icon: 'Utensils',
        title: '飲食店・小規模店舗オーナー',
        problem: 'お店の魅力、ちゃんと伝わっていますか？',
        solution:
            '4 コマ漫画でメニューのこだわりを「読ませて」伝え、SNS 拡散と来店動機の両方を強化します。',
        recommendedPlan: 'Single 4コマ / Monthly Pack',
        ctaLink: '/pricing',
        ctaText: '漫画プランを見る →',
        image: '/works/manga-4koma-1.jpg',
        imageAlt: '飲食店向け：4コマ漫画でメニュー紹介の制作例',
    },
    {
        id: 'pet-owner',
        icon: 'Heart',
        title: 'ペットオーナー',
        problem: 'うちの子の写真を、オリジナルグッズにしたい',
        solution:
            'ペット写真をイラスト化し、フレーム・グッズに展開。家族みんなが笑顔になる仕上がりをお届けします。',
        recommendedPlan: 'もふラボ Pair Set（推奨）',
        ctaLink: '/pet',
        ctaText: 'もふラボ を見る →',
        image: '/works/pet-illust-1.jpg',
        imageAlt: 'ペットオーナー向け：ペットイラスト制作例',
    },
    {
        id: 'business',
        icon: 'Building2',
        title: '企業・中小事業者',
        problem: '価格競争から抜け出す、ブランドの力を作りたい',
        solution:
            'LP 漫画・キャラ・マスコット制作を通じて、指名買い・成約率向上・採用力 UP に直結するブランド資産を構築します。',
        recommendedPlan: '1ページ漫画 / キャラクターデザイン',
        ctaLink: '/pricing',
        ctaText: '法人向けプランを見る →',
        image: '/works/manga-1page-1.jpg',
        imageAlt: '企業向け：1ページ漫画でブランド訴求の制作例',
    },
];
