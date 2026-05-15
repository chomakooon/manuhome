/**
 * ====================================================================
 * 【記入ガイド】カタチ便ができること (strengths.config.js)
 * ====================================================================
 * HomePage の StrengthsSection が読みます。
 * 「単なる制作ではない 5 つの専門性」を示すパートで、独自性を伝えます。
 *
 * ── フィールド説明 ──
 *   id           [必須] "01" "02" のゼロ埋め 2 桁文字列（装飾用大番号として表示）
 *   title        [必須] 強みの名前（例 "ビジュアル設計力"）
 *   subtitle     [必須] 1 行のキャッチコピー
 *   description  [必須] 2〜3 行の説明
 *   icon         [必須] lucide-react のコンポーネント名（文字列）
 *                      ⚠️ 利用側 HomePage.jsx の STRENGTH_ICONS マップに登録
 *                      されているもののみ可。現状: Palette / BookOpen /
 *                      GitBranch / Sparkles / Bot
 *                      新しいアイコンを使う場合は HomePage.jsx 両方を編集
 *
 * ── 推奨件数 ──
 *   5 件固定推奨（多すぎると印象がぼやけます）。
 *
 * ── 記入例 ──
 *   {
 *     id: '06',
 *     title: 'AI 撮影ディレクション',
 *     subtitle: '時短と品質を両立',
 *     description: '生成 AI を用いた素材設計・修正で、撮影コストを 1/3 にしながら世界観統一を実現。',
 *     icon: 'Camera',
 *   }
 * ====================================================================
 *
 * @file src/config/strengths.config.js
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
