/**
 * @file src/sites/pawspress/data/guideContent.js
 *
 * 「ご利用ガイド」各ページのコンテンツ定義。
 * pathname をキーに、PawsPressGuidePage がページchrome（パンくず/ヒーロー/
 * 関連ページ/末尾CTA）とブロックを描画する。
 *
 * ── ページメタ ──
 *   iconName   : lucide-react アイコン名（ヒーロー/関連カード用、ICON_MAP 参照）
 *   heroImage? : ヒーロー画像パス（未配置時はアイコン円形にフォールバック）
 *   lead       : ヒーローのサブコピー
 *   related?   : 関連ページ [{ to, iconName }]（title は guideLinks から解決）
 *   blocks     : 本文ブロック配列
 *
 * ── ブロック種別 ──
 *   { kind: 'summary',    iconName, label, value, sub }
 *   { kind: 'timeline',   items: [{ number, iconName, title, description, duration, tip, tipLink }] }
 *   { kind: 'banner',     iconName, title, text, buttonLabel, buttonHref, note }
 *   { kind: 'cards',      tone, items: [{ iconName, title, description }] }
 *   { kind: 'examples',   tone:'good'|'avoid', heading, headingIcon, badge, items: [{ src, caption, subCaption }] }
 *   { kind: 'reassurance',iconName, heading, paragraphs: [string] }
 *   { kind: 'spectable',  heading, rows: [{ label, value }] }
 *   { kind: 'list',       heading?, items: [string] }
 *   { kind: 'table',      columns: [string, string], rows: [[string, string]] }
 *   { kind: 'faq',        items: [{ q, a }] }
 *   { kind: 'prose',      heading, paragraphs: [string] }
 *   { kind: 'note',       text }
 *
 * ★ ENGINEER CONNECTION POINT ★
 *   このファイルは静的モック。実運用では各 content を CMS / API / 設定から
 *   取得する形に差し替える想定（各 ENGINEER CONNECTION POINT コメント参照）。
 */

import { orderFlowSteps } from '../../../config/order-flow-steps.config';
import {
    goodPoints,
    goodExamples,
    avoidExamples,
    photoSpecs,
} from '../../../config/photo-tips.config';

export const GUIDE_CONTENT = {
    '/pet/guide/order-flow': {
        iconName: 'Truck',
        heroImage: '/works/guide-hero-order-flow.webp',
        lead: 'もふラボ のご注文は、写真を送るだけのシンプル5ステップです。',
        related: [
            { to: '/pet/guide/photo-tips', iconName: 'Camera' },
            { to: '/pet/guide/design-check', iconName: 'CheckCircle' },
            { to: '/pet/guide/revisions', iconName: 'Edit3' },
        ],
        blocks: [
            {
                kind: 'summary',
                iconName: 'Clock',
                label: '全工程の目安',
                value: '約7〜14日',
                sub: 'プランによって異なります',
            },
            { kind: 'timeline', items: orderFlowSteps },
            {
                kind: 'banner',
                iconName: 'MessageCircle',
                title: 'ご不安があればLINEでもご相談OK',
                text: '写真の選び方、プラン選びのご相談など、お気軽にどうぞ。',
                buttonLabel: 'LINEで相談する →',
                // ★ ENGINEER CONNECTION POINT ★
                // LINE公式アカウント開設後、buttonHref に友だち追加URLを設定する。
                buttonHref: '#',
                note: '※LINE公式アカウント開設後にリンクを追加予定',
            },
        ],
    },

    '/pet/guide/photo-tips': {
        iconName: 'Camera',
        heroImage: '/works/guide-hero-photo-tips.webp',
        lead: 'イラストの仕上がりは、元のお写真で決まります。きれいに仕上がる写真のポイントをご紹介します。',
        related: [
            { to: '/pet/guide/order-flow', iconName: 'Truck' },
            { to: '/pet/guide/design-check', iconName: 'CheckCircle' },
            { to: '/pet/faq', iconName: 'HelpCircle' },
        ],
        blocks: [
            { kind: 'cards', tone: 'good', items: goodPoints },
            {
                kind: 'examples',
                tone: 'good',
                heading: 'こんな写真がおすすめ',
                headingIcon: 'CheckCircle',
                badge: '✓ 良い例',
                items: goodExamples,
            },
            {
                kind: 'examples',
                tone: 'avoid',
                heading: '避けたい写真の例',
                headingIcon: 'XCircle',
                badge: '✗ 避けたい例',
                items: avoidExamples,
            },
            {
                kind: 'reassurance',
                iconName: 'Heart',
                heading: '古い写真・少し画質が粗い写真でも大丈夫です',
                paragraphs: [
                    'ご家族の大切な記録は、必ずしも完璧な写真ばかりではありません。プロのイラストレーターが、写真の状態に応じて丁寧に調整いたします。',
                    '判断に迷われる場合は、お持ちの写真をそのままお送りください。制作前に確認のご連絡をいたします。',
                ],
            },
            { kind: 'spectable', heading: '推奨スペック', rows: photoSpecs },
        ],
    },

    '/pet/guide/design-check': {
        iconName: 'CheckCircle',
        heroImage: '/works/guide-hero-design-check.webp',
        lead: '制作後、完成イメージをメールまたはLINEでお送りします。ご満足いただいてから、グッズ化に進みます。',
        related: [
            { to: '/pet/guide/revisions', iconName: 'Edit3', title: '修正対応について' },
            { to: '/pet/guide/order-flow', iconName: 'Truck', title: 'ご注文の流れ' },
            { to: '/pet/faq', iconName: 'HelpCircle', title: 'よくある質問' },
        ],
        blocks: [
            {
                kind: 'infobox',
                iconName: 'Mail',
                label: '確認方法',
                title: 'メール または LINE',
                description: 'ご注文時にご希望の連絡方法をお選びいただけます。',
            },
            {
                kind: 'mockup',
                // ★ ENGINEER CONNECTION POINT ★
                // 確認画像の配信・承認フローは、将来マイページ or 承認API に接続する。
                src: '/works/mockup-design-check-email.webp',
                alt: 'デザイン確認メールの例',
                caption: '実際の確認画面イメージ',
                channels: [
                    { iconName: 'Mail', label: 'メールで確認' },
                    { iconName: 'MessageCircle', label: 'LINEでも確認可' },
                ],
            },
            { kind: 'sectiontitle', text: '確認の流れ' },
            {
                kind: 'timeline',
                items: [
                    { number: 1, iconName: 'Brush', title: 'イラスト完成', description: 'プロのイラストレーターが心を込めて制作いたします。', duration: '3〜5日' },
                    { number: 2, iconName: 'Send', title: '完成イメージ送付', description: 'メールまたはLINEにてご連絡します。', duration: '即日' },
                    { number: 3, iconName: 'Eye', title: 'ご確認・ご返信', description: '確定の旨、または修正希望をお知らせください。', duration: '1〜3日' },
                    { number: 4, iconName: 'CheckCircle', title: 'デザイン確定', description: '確定次第、グッズ制作に進みます。', duration: '即日' },
                ],
            },
            { kind: 'sectiontitle', text: 'ご確認いただくポイント' },
            {
                kind: 'cards',
                tone: 'primary',
                items: [
                    { iconName: 'Palette', title: '毛色・模様の再現', description: 'ベースカラー、模様の入り方、特徴的なマーキングなど。' },
                    { iconName: 'Smile', title: '表情の雰囲気', description: '目の表情、口元の柔らかさ、全体の印象。' },
                    { iconName: 'Sparkles', title: '全体のタッチ・印象', description: 'イラストのタッチ、構図のバランス、雰囲気。' },
                ],
            },
            {
                kind: 'inlinecta',
                variant: 'secondary',
                title: '修正できる回数はプランごとに異なります',
                description: 'プラン別の無料修正回数をご確認ください。',
                buttonLabel: '修正対応について →',
                buttonHref: '/pet/guide/revisions',
            },
        ],
    },

    '/pet/guide/revisions': {
        iconName: 'Edit3',
        heroImage: '/works/guide-hero-revisions.webp',
        lead: 'ご満足いただけるよう、プランごとに無料修正回数を設けています。',
        related: [
            { to: '/pet/guide/design-check', iconName: 'CheckCircle', title: 'デザイン確認について' },
            { to: '/pet#plans', iconName: 'ShoppingBag', title: 'プラン一覧' },
            { to: '/pet/faq', iconName: 'HelpCircle', title: 'よくある質問' },
        ],
        blocks: [
            {
                kind: 'infobox',
                iconName: 'Heart',
                label: '修正方針',
                title: 'ご満足いただくまで、丁寧に対応いたします',
                description: 'デザイン確認の段階で、お気づきの点を遠慮なくお知らせください。',
            },
            {
                kind: 'comparison',
                title: 'プラン別 無料修正回数',
                // ★ ENGINEER CONNECTION POINT ★
                // 修正回数は plans.js のプラン定義と連動させる（重複定義を避ける）。
                cards: [
                    { plan: 'Trial Digital', mainValue: '1', unit: '回まで', note: 'デジタル納品のお試しプラン' },
                    { plan: 'Single Item', mainValue: '2', unit: '回まで', note: 'グッズ1点プラン' },
                    { plan: 'Pair Set', mainValue: '3', unit: '回まで', note: 'グッズ2点プラン', highlighted: true },
                ],
                footnote: '回数を超える修正・大幅なデザイン変更は、別途お見積りとなります。',
            },
            { kind: 'sectiontitle', text: 'よくある修正のご依頼' },
            {
                kind: 'beforeafter',
                items: [
                    { label: '毛色を濃くする', before: '/works/revision-1-before.webp', after: '/works/revision-1-after.webp', description: 'もっと濃いめの毛色のご希望に対応' },
                    { label: '表情を笑顔に', before: '/works/revision-2-before.webp', after: '/works/revision-2-after.webp', description: '口元の表情をより明るく' },
                    { label: '背景・装飾を変更', before: '/works/revision-3-before.webp', after: '/works/revision-3-after.webp', description: 'お花や背景色の調整' },
                ],
            },
            { kind: 'sectiontitle', text: '修正対応の範囲' },
            {
                kind: 'cards',
                tone: 'primary',
                items: [
                    { iconName: 'Check', title: '無料修正の範囲', description: '毛色の調整、表情の微調整、ポーズの細かな修正、背景色の変更など。' },
                    { iconName: 'AlertCircle', title: '別途お見積りとなる場合', description: 'ペットの数を変更、構図を全面的に変える、別の写真への差し替えなど。' },
                    { iconName: 'MessageCircle', title: 'ご相談ください', description: '判断に迷うご要望は、お気軽にご相談ください。柔軟に対応いたします。' },
                ],
            },
        ],
    },

    '/pet/guide/payment': {
        iconName: 'CreditCard',
        heroImage: '/works/guide-hero-payment.webp',
        lead: 'お客様のご都合に合わせて、複数のお支払い方法をご用意しています。',
        related: [
            { to: '/pet/guide/shipping', iconName: 'Truck', title: '配送・送料' },
            { to: '/pet/guide/order-flow', iconName: 'ListChecks', title: 'ご注文の流れ' },
            { to: '/pet/faq', iconName: 'HelpCircle', title: 'よくある質問' },
        ],
        blocks: [
            {
                kind: 'infobox',
                iconName: 'Wallet',
                label: '対応決済',
                title: '4種類のお支払い方法に対応',
                description: 'クレジットカード、銀行振込、コンビニ決済、QR・スマホ決済からお選びいただけます。',
            },
            { kind: 'sectiontitle', text: 'ご利用いただける決済方法' },
            {
                kind: 'paymentmethods',
                // ★ ENGINEER CONNECTION POINT ★
                // 決済手段・手数料・決済処理は決済プロバイダ（Stripe 等）の設定から取得・接続する。
                methods: [
                    { iconName: 'CreditCard', title: 'クレジットカード', description: '主要ブランドに対応。一括払いのみ。', brands: ['Visa', 'Mastercard', 'JCB', 'Amex'] },
                    { iconName: 'Building', title: '銀行振込', description: 'ご注文後、振込先口座をメールでお知らせします。' },
                    { iconName: 'Store', title: 'コンビニ決済', description: 'セブン-イレブン、ローソン、ファミリーマートほか主要コンビニ。' },
                    { iconName: 'Smartphone', title: 'QR・スマホ決済', description: '各種QRコード決済に対応。', brands: ['PayPay', 'LINE Pay', '楽天ペイ'] },
                ],
            },
            { kind: 'sectiontitle', text: 'お支払いのタイミング' },
            {
                kind: 'paymenttimeline',
                steps: [
                    { iconName: 'ShoppingBag', label: 'ご注文' },
                    { iconName: 'CreditCard', label: 'お支払い' },
                    { iconName: 'Brush', label: '制作開始' },
                    { iconName: 'Truck', label: '発送・お届け' },
                ],
                note: 'ご注文確定時の前払いとなります。お支払い確認後に制作を開始します。',
            },
            {
                kind: 'securitybadge',
                iconName: 'ShieldCheck',
                title: '安全な決済環境',
                description: 'SSL暗号化通信で、お客様の情報を保護しています。',
                items: [
                    'クレジットカード情報は当店では保持しません',
                    '決済処理は信頼性の高い決済代行サービスを通じて行います',
                    '通信は全てSSL/TLSで暗号化されています',
                ],
            },
            {
                kind: 'alertbox',
                variant: 'info',
                iconName: 'Info',
                title: '領収書について',
                description: '領収書が必要な場合は、ご注文時または注文後にお知らせください。PDFまたは郵送でお送りします。',
            },
        ],
    },

    '/pet/guide/shipping': {
        iconName: 'Truck',
        heroImage: '/works/guide-hero-shipping.webp',
        lead: '全国送料無料でお届けします（デジタル納品プランを除く）。',
        related: [
            { to: '/pet/guide/payment', iconName: 'CreditCard', title: 'お支払い方法' },
            { to: '/pet/guide/order-flow', iconName: 'ListChecks', title: 'ご注文の流れ' },
            { to: '/pet/faq', iconName: 'HelpCircle', title: 'よくある質問' },
        ],
        blocks: [
            {
                kind: 'infobox',
                iconName: 'PiggyBank',
                label: '送料',
                title: '全国送料無料',
                description: 'Single Item / Pair Set は全国どこへでも送料無料でお届けします。',
            },
            { kind: 'sectiontitle', text: '配送情報' },
            {
                kind: 'shippinginfogrid',
                // ★ ENGINEER CONNECTION POINT ★
                // 送料・納期・配送業者は配送マスタ / 在庫API から取得する。
                items: [
                    { iconName: 'PiggyBank', label: '送料', value: '全国送料無料', note: 'デジタル納品プランを除く' },
                    { iconName: 'Truck', label: '配送方法', value: '宅配便（追跡番号あり）', note: 'ヤマト運輸または佐川急便' },
                    { iconName: 'Calendar', label: 'お届け目安', value: 'デザイン確定後 約7〜14日', note: 'プランによって異なります' },
                    { iconName: 'Globe', label: '海外配送', value: '現在は国内のみ対応', note: '今後対応予定' },
                ],
            },
            { kind: 'sectiontitle', text: 'お届けまでの流れ' },
            {
                kind: 'shippingflow',
                stages: [
                    { iconName: 'CheckCircle', label: 'デザイン確定' },
                    { iconName: 'Printer', label: '印刷' },
                    { iconName: 'PackageCheck', label: '検品' },
                    { iconName: 'Package', label: '梱包' },
                    { iconName: 'Truck', label: '発送' },
                    { iconName: 'Home', label: 'お届け' },
                ],
            },
            {
                kind: 'alertbox',
                variant: 'warning',
                iconName: 'AlertTriangle',
                title: '繁忙期のお届けについて',
                description: '年末年始・大型連休期間は通常より時間をいただく場合があります。お早めのご注文をおすすめします。',
            },
            {
                kind: 'infobox',
                iconName: 'Gift',
                label: 'ギフト発送について',
                title: '別住所への発送も承ります',
                description: 'プレゼント用に別の住所へお届けすることも可能です。ご注文時にお知らせください。',
            },
        ],
    },

    '/pet/faq': {
        iconName: 'HelpCircle',
        heroImage: '/works/guide-hero-faq.webp',
        lead: 'よくいただくご質問をまとめました。お探しの内容が見つからない場合は、お気軽にお問い合わせください。',
        related: [
            { to: '/pet/guide/order-flow', iconName: 'ListChecks', title: 'ご注文の流れ' },
            { to: '/pet/guide/photo-tips', iconName: 'Camera', title: 'お写真の選び方' },
            { to: '/pet/contact', iconName: 'Mail', title: 'お問い合わせ' },
        ],
        blocks: [
            {
                kind: 'faqcategories',
                // ★ ENGINEER CONNECTION POINT ★
                // FAQ項目は CMS / 管理画面から取得・編集できるようにする想定。
                categories: [
                    {
                        id: 'photo',
                        iconName: 'Camera',
                        title: '写真について',
                        faqs: [
                            { q: 'どんな写真でも依頼できますか？', a: '明るくピントが合った写真であれば、ほとんどの場合対応可能です。詳しくは「お写真の選び方」をご覧ください。' },
                            { q: '古い写真でも大丈夫ですか？', a: 'はい、対応可能です。多少画質が粗くてもプロのイラストレーターが調整いたします。' },
                            { q: '複数のペットを1枚に描けますか？', a: 'Pair Set プランなら2頭まで対応可能です。3頭以上は別途お見積りとなります。' },
                            { q: 'スマホで撮った写真でも問題ないですか？', a: '問題ありません。最近のスマホカメラは高画質なので、十分な品質で制作できます。' },
                        ],
                    },
                    {
                        id: 'production',
                        iconName: 'Brush',
                        title: '制作・修正について',
                        faqs: [
                            { q: '制作にどれくらいかかりますか？', a: 'プランによって異なります。Trial Digital は約7日、Single Item と Pair Set は約14日が目安です。' },
                            { q: '修正はできますか？', a: 'はい、プランごとに無料修正回数を設けております。詳しくは「修正対応について」をご覧ください。' },
                            { q: 'イラストのタッチは選べますか？', a: 'キャラクター調（メイン）と実写風の2つの画風からお選びいただけます。ご注文フォームの「画風」でお好みの画風をお選びください。' },
                            { q: '亡くなったペットのイラストもお願いできますか？', a: 'はい、心を込めて制作いたします。お写真をお送りいただく際に、その旨を一言添えていただけると幸いです。' },
                        ],
                    },
                    {
                        id: 'payment-shipping',
                        iconName: 'CreditCard',
                        title: 'お支払い・配送について',
                        faqs: [
                            { q: '支払い方法は何がありますか？', a: 'クレジットカード、銀行振込、コンビニ決済、QR・スマホ決済に対応しています。詳しくは「お支払い方法」をご覧ください。' },
                            { q: '送料はかかりますか？', a: '全国送料無料です（デジタル納品プランを除く）。' },
                            { q: '海外発送はできますか？', a: '現在は日本国内のみとなっております。今後の対応を検討しております。' },
                            { q: 'プレゼント用に別の住所へ送れますか？', a: 'はい、可能です。ご注文時にお届け先をお知らせください。' },
                        ],
                    },
                    {
                        id: 'business',
                        iconName: 'Building2',
                        title: '法人・大量注文について',
                        faqs: [
                            { q: '法人での大量注文は可能ですか？', a: 'はい、最小10個から承ります。数量に応じた割引もございます。詳しくは「法人のお客様」をご覧ください。' },
                            { q: 'ノベルティとして使えますか？', a: 'もちろん可能です。動物病院やトリミングサロン、保護団体、ペット関連企業様にご活用いただいております。' },
                            { q: '請求書払いは可能ですか？', a: '法人様の場合、ご相談に応じて請求書払いも対応可能です。お問い合わせフォームよりご相談ください。' },
                        ],
                    },
                ],
            },
            {
                kind: 'inlinecta',
                variant: 'secondary',
                title: 'ご質問が見つからない場合',
                description: 'お気軽にお問い合わせください。1営業日以内にご返信いたします。',
                buttonLabel: 'お問い合わせフォームへ →',
                buttonHref: '/pet/contact',
            },
        ],
    },

    '/pet/business': {
        category: '法人のお客様',
        iconName: 'Building2',
        heroImage: '/works/guide-hero-business.webp',
        lead: 'ノベルティ・記念品・保護団体支援など、法人・団体さまのご相談を承ります。',
        related: [
            { to: '/pet#plans', iconName: 'ShoppingBag', title: 'プラン一覧' },
            { to: '/pet/guide/order-flow', iconName: 'Truck', title: 'ご注文の流れ' },
            { to: '/pet/contact', iconName: 'Mail', title: 'お問い合わせ' },
        ],
        blocks: [
            {
                kind: 'infobox',
                iconName: 'Sparkles',
                label: '特長',
                title: 'デザイン費・送料込み、丁寧な個別対応',
                description: '個別お見積り、ご相談からデザイン提案まで一貫してサポートいたします。',
            },
            {
                kind: 'usecase',
                title: 'ご活用例',
                cases: [
                    { iconName: 'Stethoscope', title: '動物病院・トリミングサロン', description: 'ノベルティ、待合室のディスプレイ、ご利用記念品など' },
                    { iconName: 'Tag', title: 'ペット関連商品の販促', description: 'オリジナルパッケージ、購入特典、キャンペーン景品など' },
                    { iconName: 'HandHeart', title: '保護団体の支援グッズ', description: '里親募集の啓発、寄付返礼品、チャリティイベント記念品' },
                    { iconName: 'Gift', title: 'イベント記念品・贈答品', description: 'セミナー記念、株主優待、お客様への特別ギフト' },
                ],
            },
            { kind: 'sectiontitle', text: 'ロット・お見積り' },
            {
                kind: 'pricingtier',
                title: '数量別の目安',
                // ★ ENGINEER CONNECTION POINT ★
                // 数量別割引・お見積りロジックは、将来見積API / 管理設定から取得・接続する。
                tiers: [
                    { range: '10〜29個', discount: '通常価格', note: '最小ロット 10個から承ります' },
                    { range: '30〜49個', discount: '5% OFF', note: '中ロット' },
                    { range: '50〜99個', discount: '10% OFF', note: '推奨ロット', highlighted: true },
                    { range: '100個〜', discount: '個別お見積り', note: '大ロット・特別対応' },
                ],
                note: 'デザイン費・送料込み。数量・納期・カスタマイズ内容に応じて個別にお見積りいたします。',
            },
            { kind: 'sectiontitle', text: 'ご依頼から納品までの流れ' },
            {
                kind: 'timeline',
                items: [
                    { number: 1, iconName: 'Mail', title: 'お問い合わせ・ヒアリング', description: 'ご希望の用途・数量・予算・納期をお聞かせください。', duration: '1〜2日' },
                    { number: 2, iconName: 'FileText', title: 'お見積り・ご提案', description: 'デザイン提案＋お見積書をご提示します。', duration: '2〜3日' },
                    { number: 3, iconName: 'Brush', title: 'サンプル制作', description: 'ご希望に応じてサンプル制作を行います。', duration: '5〜7日' },
                    { number: 4, iconName: 'Truck', title: '本制作・納品', description: 'ご承認後、本制作・納品。', duration: '2〜4週間' },
                ],
            },
            {
                kind: 'inlinecta',
                variant: 'primary',
                // ★ ENGINEER CONNECTION POINT ★
                // 法人見積フォーム送信は /pet/contact と同じ送信処理に接続する（問い合わせ種別=法人 を付与）。
                title: '法人向け見積もりをご希望の方',
                description: 'ご利用人数・希望グッズ・納期をお知らせください。1営業日以内にご連絡いたします。',
                buttonLabel: '法人お見積りフォームへ →',
                buttonHref: '/pet/contact?type=business',
            },
        ],
    },
};

export const getGuideContent = (pathname) => GUIDE_CONTENT[pathname] ?? null;
