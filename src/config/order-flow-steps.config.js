/**
 * @file src/config/order-flow-steps.config.js
 *
 * 「ご注文の流れ」ページ（/pet/guide/order-flow）のタイムライン5ステップ定義。
 * PawsPressGuidePage が guideContent 経由で参照する。
 *
 * iconName は lucide-react のアイコン名（PawsPressGuidePage の ICON_MAP に対応）。
 * tipLink が null の場合はテキストのみ表示。
 */

export const orderFlowSteps = [
    {
        number: 1,
        iconName: 'Camera',
        title: 'お写真を送る',
        description:
            'お気に入りの1枚を、注文フォームから送信してください。複数枚送付いただくとより特徴を捉えやすくなります。',
        duration: '5分',
        tip: '「お写真の選び方」もご覧ください',
        tipLink: '/pet/guide/photo-tips',
    },
    {
        number: 2,
        iconName: 'ShoppingBag',
        title: 'プラン選択・お申し込み',
        description:
            'Trial Digital / Single Item / Pair Set / Premium Frame の4プランから、ご希望のプランを選んでお申し込みください。',
        duration: '即日',
        tip: '初めての方は Trial Digital がおすすめ',
        tipLink: '/pet#plans',
    },
    {
        number: 3,
        iconName: 'Brush',
        title: 'イラスト制作',
        description:
            'プロのイラストレーターが、写真をもとに心を込めて手描きで制作いたします。',
        duration: '3〜5日',
        tip: '制作の途中経過は基本的にお見せしません（完成時に一括でお見せします）',
        tipLink: null,
    },
    {
        number: 4,
        iconName: 'CheckCircle',
        title: 'デザイン確認',
        description:
            '完成イメージをメールまたはLINEでお送りします。修正もこの段階で承ります。',
        duration: '1〜3日',
        tip: '修正回数はプランごとに異なります',
        tipLink: '/pet/guide/revisions',
    },
    {
        number: 5,
        iconName: 'Truck',
        title: 'グッズ化・お届け',
        description:
            'デザイン確定後、グッズに展開して最短一週間でお手元にお届けします。全国送料無料。',
        duration: '5〜7日',
        tip: '海外配送は現在対応しておりません',
        tipLink: null,
    },
];
