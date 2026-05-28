/**
 * @file src/sites/pawspress/layout/PawsPressLayout.jsx
 *
 * もふラボ ブランド用の Layout（ヘッダー + メイン + フッター）。
 * /pet 配下のすべてのページがこの Layout を使用する。
 * 配色・タイポは body.theme-pawspress 配下の CSS 変数に依存。
 *
 * 注意:
 *   - ロゴ画像 /hero/pawspress-logo.jpg は未配置時は console.warn でログ出力し、
 *     img 要素を非表示にしてテキストロゴだけで成立させる
 *   - 「カタチラボへ」は内部 Link で SPA 遷移（テーマ切替も滑らか）
 */

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { GUIDE_LINKS } from '../data/guideLinks';
import './PawsPressLayout.css';

const LOGO_PATH = '/hero/pawspress-logo.jpg';
const INSTAGRAM_URL = 'https://www.instagram.com/paws_press/';

const handleLogoError = (e) => {
    e.currentTarget.style.display = 'none';
    console.warn(`[paws] logo image missing: ${LOGO_PATH}`);
};

const navLinkClass = ({ isActive }) =>
    `paws-header__link${isActive ? ' paws-header__link--active' : ''}`;

function GuideDropdown() {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    // 外側クリック / Escape で閉じる（モバイルの tap 展開時に有効）
    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div
            ref={wrapRef}
            className={`paws-guide${open ? ' paws-guide--open' : ''}`}
        >
            <button
                type="button"
                className="paws-header__link paws-guide__toggle"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen((v) => !v)}
            >
                ご利用ガイド <span className="paws-guide__caret" aria-hidden="true">▼</span>
            </button>
            <ul className="paws-guide__menu" role="menu">
                {GUIDE_LINKS.map((g) => (
                    <li key={g.label} role="none">
                        <Link
                            to={g.to}
                            role="menuitem"
                            className="paws-guide__item"
                            onClick={() => setOpen(false)}
                        >
                            {g.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function PawsPressHeader() {
    return (
        <header className="paws-header">
            <div className="paws-header__inner">
                <Link to="/pet" className="paws-header__brand" aria-label="もふラボ ホーム">
                    <img
                        src={LOGO_PATH}
                        alt="もふラボ"
                        className="paws-header__logo"
                        onError={handleLogoError}
                    />
                    <span className="paws-header__brand-text">もふラボ</span>
                </Link>

                <nav className="paws-header__nav" aria-label="サイトナビゲーション">
                    <NavLink to="/pet" end className={navLinkClass}>ホーム</NavLink>
                    <Link to="/pet#plans" className="paws-header__link">プラン</Link>
                    <NavLink to="/pet/order" className={navLinkClass}>注文</NavLink>
                    <GuideDropdown />
                    <NavLink to="/pet/contact" className={navLinkClass}>お問い合わせ</NavLink>
                </nav>

                <div className="paws-header__actions">
                    <Link to="/pet/order" className="paws-header__cta">
                        写真を送って注文する →
                    </Link>
                    <Link to="/" className="paws-header__crosslink">
                        カタチラボへ ↗
                    </Link>
                </div>
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
                        alt="もふラボ"
                        className="paws-footer__logo"
                        loading="lazy"
                        onError={handleLogoError}
                    />
                    <span>もふラボ</span>
                </div>
                <p className="paws-footer__copy">© 2026 もふラボ</p>
                <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paws-footer__sns"
                    aria-label="Instagram (@paws_press) を別タブで開く"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    @paws_press
                </a>
                <Link to="/" className="paws-footer__link">
                    カタチラボに戻る ↗
                </Link>
                <p className="paws-footer__powered">Powered by もふラボ</p>
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
