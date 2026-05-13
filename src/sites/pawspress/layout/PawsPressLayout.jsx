/**
 * @file src/sites/pawspress/layout/PawsPressLayout.jsx
 *
 * PAWS PRESS ブランド用の Layout（ヘッダー + メイン + フッター）。
 * /pet 配下のすべてのページがこの Layout を使用する。
 * 配色・タイポは body.theme-pawspress 配下の CSS 変数に依存。
 *
 * 注意:
 *   - ロゴ画像 /hero/pawspress-logo.jpg は未配置時は console.warn でログ出力し、
 *     img 要素を非表示にしてテキストロゴだけで成立させる
 *   - 「岡崎真奈のHPへ」は内部 Link で SPA 遷移（テーマ切替も滑らか）
 */

import { Link, NavLink, useLocation } from 'react-router-dom';
import './PawsPressLayout.css';

const LOGO_PATH = '/hero/pawspress-logo.jpg';

const handleLogoError = (e) => {
    e.currentTarget.style.display = 'none';
    console.warn(`[paws] logo image missing: ${LOGO_PATH}`);
};

const navLinkClass = ({ isActive }) =>
    `paws-header__link${isActive ? ' paws-header__link--active' : ''}`;

function PawsPressHeader() {
    return (
        <header className="paws-header">
            <div className="paws-header__inner">
                <Link to="/pet" className="paws-header__brand" aria-label="PAWS PRESS ホーム">
                    <img
                        src={LOGO_PATH}
                        alt="PAWS PRESS"
                        className="paws-header__logo"
                        onError={handleLogoError}
                    />
                    <span className="paws-header__brand-text">PAWS PRESS</span>
                </Link>

                <nav className="paws-header__nav" aria-label="サイトナビゲーション">
                    <NavLink to="/pet" end className={navLinkClass}>ホーム</NavLink>
                    <Link to="/pet#plans" className="paws-header__link">プラン</Link>
                    <NavLink to="/pet/order" className={navLinkClass}>注文</NavLink>
                    <NavLink to="/pet/contact" className={navLinkClass}>お問い合わせ</NavLink>
                </nav>

                <Link to="/" className="paws-header__crosslink">
                    岡崎真奈のHPへ ↗
                </Link>
            </div>
        </header>
    );
}

function PawsPressFooter() {
    return (
        <footer className="paws-footer">
            <div className="paws-footer__inner">
                <div className="paws-footer__brand">
                    <img
                        src={LOGO_PATH}
                        alt="PAWS PRESS"
                        className="paws-footer__logo"
                        loading="lazy"
                        onError={handleLogoError}
                    />
                    <span>PAWS PRESS</span>
                </div>
                <p className="paws-footer__copy">© 2026 PAWS PRESS</p>
                <Link to="/" className="paws-footer__link">
                    岡崎真奈のHPに戻る ↗
                </Link>
                <p className="paws-footer__powered">Powered by 岡崎真奈</p>
            </div>
        </footer>
    );
}

export default function PawsPressLayout({ children }) {
    const { pathname } = useLocation();
    return (
        <div className="paws-layout">
            <a href="#main-content" className="skip-link">
                メインコンテンツへスキップ
            </a>
            <PawsPressHeader />
            <main id="main-content" className="paws-layout__main" tabIndex={-1}>
                <div key={pathname} className="kt-page-fade">
                    {children}
                </div>
            </main>
            <PawsPressFooter />
        </div>
    );
}
