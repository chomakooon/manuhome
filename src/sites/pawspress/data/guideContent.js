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
        lead: 'PAWS PRESS のご注文は、写真を送るだけのシンプル5ステップです。',
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
        lead: '制作後、完成イメージをご確認いただいてからグッズ化に進みます。',
        blocks: [
            {
                kind: 'prose',
                heading: '確認の流れ',
                paragraphs: [
                    '制作が完了したら、完成イメージを画像でお送りします。メールまたはフォームからご確認ください。',
                ],
            },
            {
                kind: 'list',
                heading: 'ご確認いただくポイント',
                items: ['毛色・模様の再現', '表情の雰囲気', '全体のタッチ・印象'],
            },
            {
                kind: 'prose',
                heading: 'お返事の目安',
                paragraphs: [
                    '確認のご依頼から3日以内にお返事ください。お返事が遅れると、お届け日が後ろ倒しになる場合があります。',
                ],
            },
            // ★ ENGINEER CONNECTION POINT ★
            // 確認画像の配信・承認フローは、将来マイページ or 承認API に接続する。
        ],
    },

    '/pet/guide/revisions': {
        iconName: 'Edit3',
        lead: 'ご満足いただけるよう、プランごとに無料修正回数を設けています。',
        blocks: [
            {
                kind: 'table',
                columns: ['プラン', '無料修正回数'],
                // ★ ENGINEER CONNECTION POINT ★
                // 修正回数は plans.js のプラン定義と連動させる（重複定義を避ける）。
                rows: [
                    ['Trial Digital', '1回まで'],
                    ['Single Item', '2回まで'],
                    ['Premium Frame', '2回まで'],
                    ['Pair Set', '3回まで'],
                ],
            },
            { kind: 'note', text: '回数を超える修正・大幅なデザイン変更は、別途お見積りとなります。' },
        ],
    },

    '/pet/guide/payment': {
        iconName: 'CreditCard',
        lead: '下記のお支払い方法に対応しています。',
        blocks: [
            {
                kind: 'list',
                heading: 'ご利用いただける決済',
                // ★ ENGINEER CONNECTION POINT ★
                // 決済手段・手数料・決済処理は決済プロバイダ（Stripe 等）の設定から取得・接続する。
                items: [
                    'クレジットカード（Visa / Mastercard / JCB / AMEX）',
                    '銀行振込',
                    'コンビニ決済',
                    '各種QR・スマホ決済',
                ],
            },
            {
                kind: 'prose',
                heading: 'お支払いのタイミング',
                paragraphs: ['ご注文確定時の前払いとなります。お支払い確認後に制作を開始します。'],
            },
        ],
    },

    '/pet/guide/shipping': {
        iconName: 'Package',
        lead: '全国送料無料でお届けします（デジタルのみのプランを除く）。',
        blocks: [
            {
                kind: 'table',
                columns: ['項目', '内容'],
                // ★ ENGINEER CONNECTION POINT ★
                // 送料・納期・配送業者は配送マスタ / 在庫API から取得する。
                rows: [
                    ['送料', '全国一律無料（グッズを含むプラン）'],
                    ['配送方法', '宅配便（追跡番号あり）'],
                    ['お届け目安', 'デザイン確定後 約7〜14日'],
                    ['海外配送', '現在は国内のみ対応'],
                ],
            },
            { kind: 'note', text: '繁忙期（年末年始など）はお届けに通常より時間をいただく場合があります。' },
        ],
    },

    '/pet/faq': {
        iconName: 'HelpCircle',
        lead: 'よくいただくご質問をまとめました。',
        blocks: [
            {
                kind: 'faq',
                // ★ ENGINEER CONNECTION POINT ★
                // FAQ項目は CMS / 管理画面から取得・編集できるようにする想定。
                items: [
                    {
                        q: 'どんな写真でも依頼できますか？',
                        a: '明るくピントの合った写真であれば、スマホ撮影でも問題ありません。詳しくは「お写真の選び方」をご覧ください。',
                    },
                    {
                        q: '制作にどれくらいかかりますか？',
                        a: 'プランにより異なりますが、デザイン確定後 最短7日でお届けします。',
                    },
                    {
                        q: '複数のペットを1枚に描けますか？',
                        a: '可能です。頭数により追加料金が発生する場合がありますので、お問い合わせください。',
                    },
                    {
                        q: '修正はできますか？',
                        a: 'プランごとに無料修正回数があります。「修正対応について」をご確認ください。',
                    },
                    {
                        q: '支払い方法は？',
                        a: 'クレジットカード・銀行振込・コンビニ決済などに対応しています。',
                    },
                    {
                        q: '法人での大量注文は可能ですか？',
                        a: '可能です。「法人のお客様」よりお問い合わせください。',
                    },
                ],
            },
        ],
    },

    '/pet/business': {
        iconName: 'Building2',
        lead: 'ノベルティ・記念品・保護団体支援グッズなど、法人・団体さまのご相談を承ります。',
        blocks: [
            {
                kind: 'list',
                heading: 'ご活用例',
                items: [
                    '動物病院・トリミングサロンのノベルティ',
                    'ペット関連商品の販促・特典',
                    '保護団体の支援グッズ',
                    'イベント記念品・贈答品',
                ],
            },
            {
                kind: 'prose',
                heading: 'ロット・お見積り',
                paragraphs: [
                    '数量・納期に応じて個別にお見積りいたします。まずはお気軽にご相談ください。',
                ],
            },
            // ★ ENGINEER CONNECTION POINT ★
            // 法人問い合わせは /pet/contact と同じ送信処理に接続する（問い合わせ種別=法人 を付与）。
        ],
    },
};

export const getGuideContent = (pathname) => GUIDE_CONTENT[pathname] ?? null;
