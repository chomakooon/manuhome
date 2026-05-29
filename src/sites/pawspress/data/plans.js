/**
 * @file src/sites/pawspress/data/plans.js
 *
 * もふらぼ の販売プラン定義。/pet トップの「プランから選ぶ」セクションと、
 * 将来の /pet/order ページから参照される。
 *
 * 編集ルール:
 *   - 1プラン = 1要素
 *   - id は CTA の query string で利用される: /pet/order?plan=<id>
 *   - 「人気No.1」等のバッジは popular: true + badge で表示
 *   - 並び順は「価格の安い順 + お試し→通常→セット→プレミアム」の購買心理階段
 *   - badgeTone で色を出し分け: 'primary'(cyan) / 'pink' / 'gold' など
 */

export const pawspressPlans = [
    {
        id: 'pet-trial',
        name: 'Trial Digital',
        price: 4980,
        priceLabel: '¥4,980',
        image: '/plans/trial.webp',
        imageAlt: 'スマホで受け取るイラストデータのイメージ',
        tagline: 'まずはお試し、デジタルデータのみ',
        features: [
            'フルカラーイラスト1点',
            'デジタルデータ納品（高解像度PNG/JPG）',
            'SNSアイコン用トリミング画像',
            '修正1回まで',
        ],
        deliveryDays: 7,
        popular: false,
    },
    {
        id: 'pet-single',
        name: 'Single Item',
        price: 7800,
        priceLabel: '¥7,800',
        image: '/plans/single.webp',
        imageAlt: 'オリジナルアイテム1点（トートバッグ）の作例',
        tagline: '日常で使える、1点もの',
        features: [
            'フルカラーイラスト1点',
            'グッズ1点（Tシャツ/トートバッグ/マグカップ/アクキーから選択）',
            '送料無料（全国一律）',
            '修正2回まで',
        ],
        deliveryDays: 14,
        popular: false,
    },
    {
        id: 'pet-pair',
        name: 'Pair Set',
        price: 9900,
        priceLabel: '¥9,900',
        image: '/plans/pair.webp',
        imageAlt: '組み合わせ自由、選べる2点の作例（Tシャツ・マグ・トートなど）',
        // 期間限定セール: 通常 ¥12,800 → 今だけ ¥9,900
        originalPriceLabel: '¥12,800',
        saleLabel: '今だけ',
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
        badgeTone: 'pink',
    },
];

/**
 * グッズ注文時に追加できるギフトオプション（注文フォームで +料金として選択）。
 * プラン表示セクションの案内と注文フォームのチェックボックスで共通利用する。
 *
 * ★ ENGINEER CONNECTION POINT ★
 *   料金・適用条件は決済/受注処理側の設定と整合させること（price=3300）。
 */
export const GIFT_WRAP_OPTION = {
    id: 'gift-wrap',
    label: 'プレゼント用特別包装 ＋ メッセージカード添え',
    price: 3300,
    priceLabel: '+¥3,300',
    description:
        'グッズをご注文の際、注文フォームで追加できます。大切な方への贈り物に。',
};
