/**
 * ====================================================================
 * 【記入ガイド】SEO / OGP / 構造化データ (seo.config.js)
 * ====================================================================
 * 各ページコンポーネントが <PageSeo pageKey="xxx" /> 経由でこれを読みます。
 *
 * ⚠️ 公開前に必ず確認・更新が必要な箇所:
 *   1. SEO_DEFAULTS.siteUrl       — 独自ドメイン取得時に置換
 *   2. SEO_DEFAULTS.twitterHandle — 現状 "@kataribin_jp"（仮）→ 実アカウントへ
 *   3. ORG_JSON_LD.sameAs         — 実 SNS URL を配列で（社会的証明の強化）
 *
 * ── フィールド説明 ──
 *   SEO_DEFAULTS
 *     siteName            サイト名（OG / Twitter で使用）
 *     siteUrl             本番 URL（末尾スラッシュなし）
 *     author              運営者名
 *     locale              既定 'ja_JP'
 *     defaultDescription  全ページのフォールバック説明文
 *     keywords[]          検索キーワード
 *     defaultOgImage      og:image のフォールバック
 *     twitterHandle       @ から始まる Twitter ハンドル
 *
 *   PAGE_SEO.<key>
 *     path        対応するルート
 *     title       <title> + og:title + twitter:title
 *     description meta description（80〜160 字目安）
 *     ogImage     1200×630px 推奨。public/og-images/ 配下
 *
 *   ORG_JSON_LD  Organization 構造化データ（Schema.org）
 *     sameAs[]   ⚠️ 実 SNS URL に置き換える対象（現状は空配列）
 *
 * ── OG 画像について ──
 *   public/og-images/README.txt に必要画像一覧あり。未配置時は SNS シェア時に
 *   画像なしで表示される（致命的ではないが説得力 ↓）。
 * ====================================================================
 *
 * @file src/config/seo.config.js
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
    twitterHandle: '@kataribin_jp', // ← サンプル、要差し替え（実 X ハンドル）
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
