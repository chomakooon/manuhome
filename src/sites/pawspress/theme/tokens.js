/**
 * @file src/sites/pawspress/theme/tokens.js
 *
 * 「もふラボ（ペットグッズ専門ブランド）」のデザイントークン。
 * メインカラーはかたち便と同系統のシアンを採用しつつ、ペット系の温かみを出す
 * 桃色系アクセントを追加して差別化する方針。
 *
 * 注意:
 *   - 色とフォントの最終確定は次ステップ。本ファイルは仮値（提案ベース）
 *   - 値の変更は他サイト（kataribin）に波及させないこと
 *   - 純粋な値のみ（JSX / 関数 / 副作用は持たない）
 */

export const theme = {
    brandName: 'もふラボ',
    brandTagline: 'うちの子と暮らす、毎日のグッズ屋さん',

    colors: {
        primary: '#00CFFF',       // 同系統のシアン（ブランドファミリー感を維持）
        primaryDark: '#00B1D9',
        accent: '#FFB6C1',        // ペット系暖色アクセント（仮）— 次ステップで確定
        text: '#2D2520',          // やや暖色寄りの黒（仮）
        bg: '#FFF8F5',            // 暖色寄りオフホワイト（仮、kataribin の #FAFAF8 と差別化）
    },

    fonts: {
        // display は丸ゴシックで親しみやすさを強調する想定
        display: "'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif",
        body: "'Noto Sans JP', 'Inter', -apple-system, sans-serif",
    },

    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem',
    },
};
