/**
 * @file src/sites/pawspress/data/plans.js
 *
 * PAWS PRESS の販売プラン定義。/pet トップの「プランから選ぶ」セクションと、
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
        tagline: 'まずはお試し、デジタルデータのみ',
        features: [
            'フルカラーイラスト1点',
            'デジタルデータ納品（高解像度PNG/JPG）',
            'SNSアイコン用トリミング画像',
            '修正1回まで',
        ],
        deliveryDays: 7,
        popular: false,
        badge: '初めての方に',
        badgeTone: 'primary',
    },
    {
        id: 'pet-single',
        name: 'Single Item',
        price: 7800,
        priceLabel: '¥7,800',
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
        price: 12800,
        priceLabel: '¥12,800',
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
    {
        id: 'pet-frame',
        name: 'Premium Frame',
        price: 9800,
        priceLabel: '¥9,800',
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
        badge: '贈り物に人気',
        badgeTone: 'gold',
    },
];
