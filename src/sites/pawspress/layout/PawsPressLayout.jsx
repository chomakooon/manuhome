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

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './PawsPressLayout.css';

const LOGO_PATH = '/hero/pawspress-logo.jpg';

// ご利用ガイド ドロップダウン項目。
// to は将来の遷移先（Batch B / Phase 26.5 で実装予定）。
// 各ページ未実装の間は href="#" のプレースホルダとして表示する。
const GUIDE_LINKS = [
    { label: 'ご注文の流れ', to: '/pet/guide/order-flow' },
    { label: 'お写真の選び方', to: '/pet/guide/photo-tips' },
    { label: 'デザイン確認について', to: '/pet/guide/design-check' },
    { label: '修正対応について', to: '/pet/guide/revisions' },
    { label: 'お支払い方法', to: '/pet/guide/payment' },
    { label: '配送・送料', to: '/pet/guide/shipping' },
    { label: 'よくある質問', to: '/pet/faq' },
    { label: '法人のお客様', to: '/pet/business' },
];

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
                        {/* TODO(Batch B): 各ガイドページ実装後、button を <Link to={g.to}> に差し替え。
                            現状はルート未実装（catch-all なし）のためプレースホルダ button。 */}
                        <button
                            type="button"
                            role="menuitem"
                            className="paws-guide__item"
                            onClick={() => setOpen(false)}
                        >
                            {g.label}
                        </button>
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
                    <GuideDropdown />
                    <NavLink to="/pet/contact" className={navLinkClass}>お問い合わせ</NavLink>
                </nav>

                <div className="paws-header__actions">
                    <Link to="/pet/order" className="paws-header__cta">
                        写真を送って注文する →
                    </Link>
                    <Link to="/" className="paws-header__crosslink">
                        岡崎真奈のHPへ ↗
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
