/**
 * @file src/config/pricing.config.js
 *
 * /pricing ページに表示する料金プラン一覧（テナント "manuhome"）。
 * PricingPage / その他の料金参照箇所はこのファイルだけを参照する想定。
 *
 * @see ./_schema.js  (PricingPlan の型定義)
 *
 * 編集ルール:
 *   - 1プラン = pricingPlans 配列の1要素
 *   - id はサイト内で一意。CTA は /contact?plan=<id> で受け取れる想定
 *   - category は pricingCategories の id と揃える
 *   - sortOrder で並び替えされる
 *
 * メモ:
 *   - もふらぼ 側 (/pet/order) も同じペット系 3 プランを使用しているが、
 *     もふらぼ のテナントは src/sites/pawspress/data/plans.js に独立して
 *     データを持つ。両者の価格・特徴は意図的に同一にしている。
 */

/**
 * @typedef {Object} PricingCategory
 * @property {string} id
 * @property {string} label
 * @property {string} [description]
 * @property {number} [sortOrder]
 */
export const pricingCategories = [
    {
        id: 'pet',
        label: 'リアル・ペットイラスト',
        description: 'うちの子の写真を、世界に一つのイラストグッズに。',
        sortOrder: 1,
    },
    {
        id: 'businesscard',
        label: '名刺デザイン',
        description: '似顔絵入りで第一印象に温かみを添えます。',
        sortOrder: 2,
    },
    {
        id: 'manga',
        label: '漫画・4コマ',
        description: 'B2B向けPR漫画。継続発信のための Monthly Pack も。',
        sortOrder: 3,
    },
];

/** @type {Array<import('./_schema.js').PricingPlan & { priceLabel: string, tagline: string, badge?: string, priceUnit?: string }>} */
export const pricingPlans = [
    // ── ペット ──
    {
        id: 'pet-frame',
        category: 'pet',
        name: 'Premium Frame',
        price: 9800,
        priceLabel: '¥9,800',
        currency: 'JPY',
        tagline: '額装で残す、家族の記念',
        features: [
            'フルカラーイラスト1点（A5サイズ相当）',
            '額装フレーム付き',
            'デジタルデータ納品（高解像度PNG/JPG）',
            'SNSアイコン用トリミング画像',
            '修正2回まで',
        ],
        deliveryDays: 7,
        popular: false,
        cta: { label: 'もふらぼで詳しく見る', to: '/pet' },
    },
    {
        id: 'pet-single',
        category: 'pet',
        name: 'Single Item',
        price: 7800,
        priceLabel: '¥7,800',
        currency: 'JPY',
        tagline: '日常で使える、1点もの',
        features: [
            'フルカラーイラスト1点',
            'グッズ1点（Tシャツ/トートバッグ/マグカップ/アクキーから選択）',
            '送料無料（全国一律）',
            '修正2回まで',
        ],
        deliveryDays: 14,
        popular: false,
        cta: { label: 'もふらぼで詳しく見る', to: '/pet' },
    },
    {
        id: 'pet-pair',
        category: 'pet',
        name: 'Pair Set',
        price: 12800,
        priceLabel: '¥12,800',
        currency: 'JPY',
        tagline: '1点ずつより、断然お得',
        features: [
            'フルカラーイラスト1点',
            'グッズ2点（種類自由に組合せ可）',
            '送料無料（全国一律）',
            '修正3回まで',
            'デジタルデータ納品',
        ],
        deliveryDays: 14,
        popular: true,
        badge: '人気No.1',
        cta: { label: 'もふらぼで詳しく見る', to: '/pet' },
    },

    // ── 名刺 ──
    {
        id: 'card-basic',
        category: 'businesscard',
        name: 'Basic',
        price: 19800,
        priceLabel: '¥19,800',
        currency: 'JPY',
        tagline: 'シンプル&きちんと',
        features: [
            '両面デザイン1案',
            '修正2回まで',
            '入稿用PDF納品',
            '基本フォント・配色のご提案',
        ],
        deliveryDays: 7,
        popular: false,
        cta: { label: 'このプランで相談', to: '/contact?plan=card-basic' },
    },
    {
        id: 'card-portrait',
        category: 'businesscard',
        name: 'Portrait',
        price: 34800,
        priceLabel: '¥34,800',
        currency: 'JPY',
        tagline: '似顔絵入りで第一印象アップ',
        features: [
            '両面デザイン1案',
            '似顔絵イラスト1点',
            '修正3回まで',
            '入稿用PDF + 印刷データ',
            'SNSアイコン用カット画像つき',
        ],
        deliveryDays: 10,
        popular: true,
        badge: '推奨',
        cta: { label: 'このプランで相談', to: '/contact?plan=card-portrait' },
    },

    // ── 漫画 ──
    {
        id: 'manga-single-4koma',
        category: 'manga',
        name: 'Single 4コマ',
        price: 38000,
        priceLabel: '¥38,000',
        currency: 'JPY',
        tagline: 'スポット導入向け',
        features: [
            'カラー4コマ1本',
            'シナリオ作成 / 構成1案',
            '修正2回まで',
            'PNG/JPG納品',
        ],
        deliveryDays: 14,
        popular: false,
        cta: { label: 'このプランで相談', to: '/contact?plan=manga-single-4koma' },
    },
    {
        id: 'manga-1page',
        category: 'manga',
        name: '1ページ漫画',
        price: 78000,
        priceLabel: '¥78,000',
        currency: 'JPY',
        tagline: 'LP・採用広報向け',
        features: [
            'カラー1ページ漫画',
            'シナリオ + コマ割り設計',
            '修正3回まで',
            'PNG/JPG/PSD納品',
            'SNS告知用切り抜き画像つき',
        ],
        deliveryDays: 21,
        popular: false,
        cta: { label: 'このプランで相談', to: '/contact?plan=manga-1page' },
    },
    {
        id: 'manga-monthly',
        category: 'manga',
        name: 'Monthly Pack',
        price: 98000,
        priceLabel: '¥98,000',
        priceUnit: '月',
        currency: 'JPY',
        tagline: '継続発信のためのお得な月額制',
        features: [
            '月3本（4コマ × 2 + 1ページ × 1 等、組み替え可）',
            '優先制作枠',
            'シナリオ相談込み',
            '修正3回まで／本',
            '解約はいつでも可能',
        ],
        deliveryDays: 21,
        popular: true,
        badge: '推奨',
        note: '初月のみご相談ヒアリングに2〜3営業日',
        cta: { label: 'このプランで相談', to: '/contact?plan=manga-monthly' },
    },
];

export const pricingNotes = [
    '修正回数は各プランの内容に準じます。プラン外の修正はオプションでご相談いただけます。',
    '納期はお申込みから営業日換算です。素材ご提供のタイミングにより前後します。',
    '商用利用は基本的にOKです。利用範囲（媒体・期間等）は事前にお知らせください。',
    'プラン外の追加納品物（例: 高解像度透過PNG、入稿データ等）はオプションで承ります。',
];

export const pricingFaq = [
    {
        q: '修正は何回までできますか？',
        a: 'プランごとに2〜3回までを基本とし、ラフ段階での方向修正を中心に承ります。プラン外の追加修正もオプションでご相談いただけます。',
    },
    {
        q: '納期はどのくらいですか？',
        a: '7〜21営業日が目安です。お急ぎの場合は別途ご相談ください（土日対応の応相談）。',
    },
    {
        q: '商用利用はできますか？',
        a: '基本的にすべて商用利用OKです。利用媒体や期間が広範な場合は追加ライセンスをご案内します。',
    },
    {
        q: '納品形式は何が選べますか？',
        a: 'PNG / JPG / PSD / AI / PDF などプランに応じてご用意します。希望形式があればお申し付けください。',
    },
];
