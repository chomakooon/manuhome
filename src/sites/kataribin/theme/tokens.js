/**
 * @file src/sites/kataribin/theme/tokens.js
 *
 * 「カタチラボ」ブランドのデザイントークン。
 * Step 2-D で全面再構成（旧コラム雑誌風コンセプトは廃止）。
 *
 * 注意:
 *   - 純粋な値のみ（JSX / 関数 / 副作用は持たない）
 *   - src/index.css の :root および body.theme-kataribin と整合させる
 *   - 他サイト（pawspress）の theme は import しない
 */

export const theme = {
    brandName: 'カタチラボ',
    brandTagline: 'Katachi Labo',

    colors: {
        primary: '#00CFFF',           // 共通ブランドシアン
        primaryDark: '#00B1D9',
        accent: '#5CE1FF',
        accentSoft: '#FFF5F2',        // 暖色寄り超薄ピンクベージュ（背景アクセント）
        text: '#1A1A1A',
        textSubtle: '#5A5A5A',
        bg: '#FAFAF8',
        bgSubtle: '#F5F5F2',
        border: '#E8E8E5',
    },

    fonts: {
        display: "'Noto Sans JP', 'Inter', -apple-system, sans-serif",
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
