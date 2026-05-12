/**
 * @file src/config/seo.config.js
 *
 * SEO / OGP / Twitter Card / 構造化データの単一ソース（Phase 15）。
 * 各ページコンポーネントは src/components/PageSeo を経由して参照する。
 *
 * 編集ルール:
 *   - siteUrl は本番ドメインに合わせて更新（末尾スラッシュなし）
 *   - title は「<ページ名> | カタチ便」を基本とし、ホームのみ「<キャッチコピー>」形式
 *   - description は 80〜160 字目安（検索結果表示の上限を意識）
 *   - ogImage は 1200×630px の絶対パス推奨（public/og-images/ 配下）
 *
 * TODO(運用):
 *   - twitterHandle を実アカウントへ更新
 *   - public/og-images/ 配下に画像を配置（未配置時は defaultOgImage にフォールバック）
 */

export const SEO_DEFAULTS = {
    siteName: 'カタチ便',
    siteUrl: 'https://manuhome.vercel.app',
    author: '岡崎真奈',
    locale: 'ja_JP',
    defaultDescription:
        '岡崎真奈が運営する個人クリエイティブスタジオ「カタチ便」。漫画・キャラクター・ペットイラスト・名刺・ロゴ・グッズ制作まで、伝えたい想いを一枚の絵に。お見積もり無料。',
    keywords: [
        'イラスト',
        '漫画',
        'キャラクターデザイン',
        'ペットイラスト',
        '名刺デザイン',
        'ロゴデザイン',
        '4コマ漫画',
        'PR漫画',
        '岡崎真奈',
        'カタチ便',
    ],
    defaultOgImage: '/og-images/og-home.jpg',
    twitterCard: 'summary_large_image',
    twitterHandle: '@kataribin_jp', // TODO: 実アカウントに差し替え
};

/**
 * ページキーごとの SEO データ。
 * - title: <title> + og:title + twitter:title に使用
 * - description: <meta name="description"> + og:description + twitter:description
 * - ogImage: 省略時は SEO_DEFAULTS.defaultOgImage が使われる
 * - ogType: 既定 'website'（記事系を追加するときに 'article' へ）
 */
export const PAGE_SEO = {
    home: {
        path: '/',
        title: 'カタチ便 | 伝えたいを、イラストで一瞬に。',
        description:
            '漫画・キャラクター・ペットイラスト・名刺・ロゴ制作までワンストップ。ヒアリング重視で「伝えたい想い」を視覚化する個人クリエイティブスタジオ「カタチ便」（運営: 岡崎真奈）。お見積もり無料。',
        ogImage: '/og-images/og-home.jpg',
    },
    pricing: {
        path: '/pricing',
        title: '料金プラン | カタチ便',
        description:
            'ペットイラスト・4コマ漫画・名刺・キャラクターデザインなど、ジャンル別の料金プランをご紹介。ご相談ベースで柔軟に対応します。',
        ogImage: '/og-images/og-pricing.jpg',
    },
    flow: {
        path: '/flow',
        title: '制作の流れ | カタチ便',
        description:
            'お問い合わせから納品までの 4 ステップをわかりやすく解説。商用利用や修正対応の範囲も明記しています。',
        ogImage: '/og-images/og-flow.jpg',
    },
    contact: {
        path: '/contact',
        title: 'お問い合わせ | カタチ便',
        description:
            '気軽な相談窓口です。お見積もり・ヒアリング無料、平日 24 時間以内に返信いたします。参考画像のアップロードにも対応しています。',
        ogImage: '/og-images/og-contact.jpg',
    },
    about: {
        path: '/about',
        title: 'カタチ便について | 岡崎真奈',
        description:
            '運営者・岡崎真奈の自己紹介と、カタチ便を始めた理由・3 つのこだわり・制作スタイルをご紹介します。',
        ogImage: '/og-images/og-about.jpg',
    },
    portfolio: {
        path: '/portfolio',
        title: '制作事例 | カタチ便',
        description:
            'ペットイラスト・4コマ漫画・キャラクターデザイン・名刺・LP漫画など、カテゴリ別の制作事例をご紹介します。',
        ogImage: '/og-images/og-portfolio.jpg',
    },
    diagnostic: {
        path: '/diagnostic',
        title: 'ビジュアル診断 | カタチ便',
        description:
            'いくつかの質問に答えるだけで、あなたに合った制作プランの方向性をご提案する無料診断です。',
        ogImage: '/og-images/og-diagnostic.jpg',
    },
    links: {
        path: '/links',
        title: 'SNS・リンク | カタチ便',
        description:
            'Instagram / X / note / LINE / メールなど、カタチ便および岡崎真奈の各プラットフォームへのリンク集です。',
        ogImage: '/og-images/og-links.jpg',
    },
    services: {
        path: '/services',
        title: 'サービス案内 | カタチ便',
        description:
            'カタチ便のサービス全体像と提供価値、代表挨拶を新聞風レイアウトでご紹介します。',
        ogImage: '/og-images/og-services.jpg',
    },
    pet: {
        path: '/pet',
        title: 'PAWS PRESS | ペットイラストグッズ専門ブランド',
        description:
            'カタチ便のサブブランド「PAWS PRESS」。うちの子の写真を、世界に一つのイラストグッズに仕上げます。',
        ogImage: '/og-images/og-pet.jpg',
    },
    petOrder: {
        path: '/pet/order',
        title: 'ご注文フロー | PAWS PRESS',
        description:
            '4 ステップのフォームで、プラン選択・写真アップロード・お客様情報入力・確認まで完結。',
        ogImage: '/og-images/og-pet.jpg',
    },
    petContact: {
        path: '/pet/contact',
        title: 'お問い合わせ | PAWS PRESS',
        description:
            'PAWS PRESS へのお問い合わせ窓口。商品仕様や納期など、お気軽にご相談ください。',
        ogImage: '/og-images/og-pet.jpg',
    },
};

/**
 * Organization JSON-LD（全ページに埋め込み）。
 */
export const ORG_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_DEFAULTS.siteName,
    url: SEO_DEFAULTS.siteUrl,
    logo: `${SEO_DEFAULTS.siteUrl}/favicon.svg`,
    description: SEO_DEFAULTS.defaultDescription,
    founder: {
        '@type': 'Person',
        name: SEO_DEFAULTS.author,
    },
    sameAs: [
        // TODO: 実 SNS URL を更新（social.config.js と同期させる）
    ],
};
