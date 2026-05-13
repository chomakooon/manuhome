/**
 * @file src/config/strengths.config.js
 *
 * HomePage「カタチ便ができること（5 つの強み）」セクションのデータ（Phase 19）。
 * 単なる制作物販売ではなく「経営価値を提供するブランディングパートナー」としての
 * 独自性を、5 つの専門性で示す。松本氏ブランディング論の「独自性の明示」を反映。
 *
 * 編集ルール:
 *   - icon は lucide-react のコンポーネント名（文字列）
 *     利用側 HomePage の STRENGTH_ICONS マップに登録された 5 種のみ可
 *   - id は "01" 〜 "99" のゼロ埋め 2 桁文字列（装飾用に大きく表示する）
 *   - subtitle は 1 行短文、description は 2 〜 3 行
 *   - 並び順は配列順
 *
 * TODO(運用): 岡崎さんが事業の実態に合わせて 5 項目の表現を磨いてください。
 */

/**
 * @typedef {Object} Strength
 * @property {string} id           - "01" 等のゼロ埋め番号
 * @property {string} title
 * @property {string} subtitle     - 一行キャッチ
 * @property {string} description  - 2〜3 行の説明
 * @property {string} icon         - lucide-react component name
 */

/** @type {Strength[]} */
export const STRENGTHS = [
    {
        id: '01',
        title: 'ビジュアル設計力',
        subtitle: '圧倒的な世界観構築',
        description:
            'ペット・キャラ・ブランドの「らしさ」を視覚化。一目で記憶に残るデザインを実現します。',
        icon: 'Palette',
    },
    {
        id: '02',
        title: '漫画ストーリーテリング',
        subtitle: '読み手の心に届く',
        description:
            '4 コマ漫画・販促漫画で、サービスの価値を「読ませて伝える」ことができます。',
        icon: 'BookOpen',
    },
    {
        id: '03',
        title: 'ユーザー導線設計',
        subtitle: '問い合わせに繋がる',
        description:
            '見る人を行動に導く構成・配置を設計。ただ綺麗なだけのデザインを超えます。',
        icon: 'GitBranch',
    },
    {
        id: '04',
        title: 'コピー & ブランディング',
        subtitle: '売れる仕組みを作る',
        description:
            '伝わる言葉・統一感のある世界観で、価格競争から抜け出すブランドを構築します。',
        icon: 'Sparkles',
    },
    {
        id: '05',
        title: 'AI 自動化設計',
        subtitle: '業務効率化まで踏み込む',
        description:
            '制作物の納品で終わらず、SNS 運用・受注フローまで AI で効率化できます。',
        icon: 'Bot',
    },
];
