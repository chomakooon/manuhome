/**
 * @file src/sites/kataribin/theme/tokens.js
 *
 * 「かたち便（岡崎真奈のHP）」ブランドのデザイントークン。
 * 値は src/index.css の CSS 変数と整合させてある（既存サイトのトーンを継承）。
 *
 * 編集ルール:
 *   - 純粋な値のみ（JSX / 関数 / 副作用は持たない）
 *   - 値の変更は当面 src/index.css の :root と手動で同期させる
 *     （次ステップで tokens.js → CSS 変数の自動連動に寄せる予定）
 *   - 他サイト（pawspress）の theme は import しない
 */

export const theme = {
    brandName: 'かたち便',
    brandTagline: '岡崎真奈のクリエイティブHP',

    colors: {
        primary: '#00CFFF',       // Katachi-ben Cyan
        primaryDark: '#00B1D9',   // hover 時
        accent: '#5CE1FF',        // 軽いハイライト用
        text: '#1A1A1A',
        bg: '#FAFAF8',            // 新聞紙風オフホワイト
    },

    fonts: {
        display: "'Noto Serif JP', Georgia, serif",
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
