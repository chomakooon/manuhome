/**
 * @file src/sites/pawspress/theme/tokens.js
 *
 * 「もふらぼ（ペットグッズ専門ブランド）」のデザイントークン。
 * 2026-05-29: 差し色を「朱赤 #C13832」に転換。
 * うちの子の温かみ × 朱赤の親しみやすさで、カタチらぼとは独立したアイデンティティを構築。
 *
 * 実体は src/index.css の `body.theme-pawspress` ブロックで CSS 変数化されている。
 * このファイルはドキュメント / リファレンス目的（JSX 内から値参照したい場合のみ import）。
 *
 * 注意:
 *   - 値の変更は他サイト（kataribin）に波及させないこと
 *   - 純粋な値のみ（JSX / 関数 / 副作用は持たない）
 */

export const theme = {
    brandName: 'もふらぼ',
    brandTagline: 'うちの子と暮らす、毎日のグッズ屋さん',

    colors: {
        primary: '#C13832',       // 朱赤 (差し色)。白背景 6.6:1 で WCAG AA 達成
        primaryDark: '#A32C26',   // hover / 濃色テキスト用
        accent: '#F4A890',        // コーラル (差し色の補助)
        accentSoft: '#FFF1ED',    // 極淡クリームコーラル (背景tint)
        text: '#2D2520',          // 暖色寄り黒
        textSubtle: '#6B5751',    // 暖色寄りグレー
        bg: '#FFFAF6',            // 暖色オフホワイト
        bgSubtle: '#FAF0EA',      // 淡いウォームクリーム
        border: '#EDDFD9',        // 暖色ボーダー
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
