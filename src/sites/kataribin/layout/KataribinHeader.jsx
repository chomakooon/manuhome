/**
 * @file src/sites/kataribin/layout/KataribinHeader.jsx
 *
 * カタチらぼ（メイン HP）用ヘッダー。
 * - 左: ピクセルアート鳥のロゴ + 「カタチらぼ」+ 「Katachi Labo」
 * - 中央右: 7項目ナビ
 * - 右端: もふらぼ への控えめリンク
 * - <=1024px: ハンバーガー → 右からスライドインメニュー
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import doveLogoWebp from '../../../assets/pixel_art_dove.webp';
import doveLogo from '../../../assets/pixel_art_dove.png';
import './KataribinHeader.css';

// Phase 18: SearchModal は検索アイコン押下時のみ表示されるため lazy 化。
// 同梱の focus-trap-react（gzip 約 10kB）も初回ロードから外れる。
const SearchModal = lazy(() => import('../components/SearchModal'));

// Phase 12.5: ナビは 7 項目を維持しつつ「ビジュアル診断」を「カタチらぼについて」に置換。
// /diagnostic は補助機能としてフッター・ホーム CTA 等から到達可能（ルート自体は存続）。
const NAV_ITEMS = [
    { path: '/', label: 'ホーム', exact: true },
    { path: '/pricing', label: 'プラン' },
    { path: '/portfolio', label: '制作事例' },
    { path: '/flow', label: '制作の流れ' },
    { path: '/about', label: 'カタチらぼについて' },
    { path: '/links', label: 'SNS・リンク' },
    { path: '/contact', label: 'お問い合わせ' },
];

export default function KataribinHeader() {
    const location = useLocation();
    // location.key を派生キーとして「いつ開いたか」を記録することで、
    // 次のナビゲーション時に自動で閉じる（setState in effect を避けるため）。
    const [openOnKey, setOpenOnKey] = useState(null);
    const menuOpen = openOnKey === location.key;
    const [searchOpenOnKey, setSearchOpenOnKey] = useState(null);
    const searchOpen = searchOpenOnKey === location.key;

    useEffect(() => {
        if (!menuOpen) return;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const toggleMenu = () => setOpenOnKey(menuOpen ? null : location.key);
    const closeMenu = () => setOpenOnKey(null);

    const renderNavLink = (item) => {
        if (item.hash) {
            return (
                <Link key={item.path} to={item.path} className="kt-nav__link">
                    {item.label}
                </Link>
            );
        }
        return (
            <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                    `kt-nav__link${isActive ? ' kt-nav__link--active' : ''}`
                }
            >
                {item.label}
            </NavLink>
        );
    };

    return (
        <header className="kt-header">
            <div className="kt-header__inner">
                <Link to="/" className="kt-brand" aria-label="カタチらぼホーム">
                    <picture>
                        <source srcSet={doveLogoWebp} type="image/webp" />
                        <img src={doveLogo} alt="" className="kt-brand__logo" />
                    </picture>
                    <span className="kt-brand__text">
                        <span className="kt-brand__name">カタチらぼ</span>
                        <span className="kt-brand__sub" lang="en">Katachi Labo</span>
                    </span>
                </Link>

                <nav
                    id="kt-primary-nav"
                    className={`kt-nav${menuOpen ? ' kt-nav--open' : ''}`}
                    aria-label="メインナビゲーション"
                >
                    {NAV_ITEMS.map(renderNavLink)}
                    <Link to="/pet" className="kt-nav__pp-mobile">
                        ペットグッズ専門 もふらぼ →
                    </Link>
                </nav>

                <div className="kt-header__actions">
                    <button
                        type="button"
                        className="kt-header__search"
                        onClick={() => setSearchOpenOnKey(location.key)}
                        aria-label="サイト内検索を開く"
                        aria-haspopup="dialog"
                    >
                        <Search size={18} strokeWidth={2} aria-hidden="true" />
                    </button>
                    <Link to="/pet" className="kt-pawspress-link">
                        ペットグッズ専門 もふらぼ →
                    </Link>
                </div>

                <button
                    type="button"
                    className={`kt-burger${menuOpen ? ' kt-burger--open' : ''}`}
                    onClick={toggleMenu}
                    aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                    aria-expanded={menuOpen}
                    aria-controls="kt-primary-nav"
                >
                    <span /><span /><span />
                </button>
            </div>

            {menuOpen && (
                <div
                    className="kt-overlay"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}

            {searchOpen && (
                <Suspense fallback={null}>
                    <SearchModal
                        open={searchOpen}
                        onClose={() => setSearchOpenOnKey(null)}
                    />
                </Suspense>
            )}
        </header>
    );
}
