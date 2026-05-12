/**
 * @file src/sites/kataribin/layout/KataribinHeader.jsx
 *
 * カタチ便（メイン HP）用ヘッダー。
 * - 左: ピクセルアート鳥のロゴ + 「カタチ便」+ 「岡崎真奈 / Okazaki Mana」
 * - 中央右: 7項目ナビ
 * - 右端: PAWS PRESS への控えめリンク
 * - <=1024px: ハンバーガー → 右からスライドインメニュー
 */

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import doveLogo from '../../../assets/pixel_art_dove.png';
import SearchModal from '../components/SearchModal';
import './KataribinHeader.css';

// Phase 12.5: ナビは 7 項目を維持しつつ「ビジュアル診断」を「カタチ便について」に置換。
// /diagnostic は補助機能としてフッター・ホーム CTA 等から到達可能（ルート自体は存続）。
const NAV_ITEMS = [
    { path: '/', label: 'ホーム', exact: true },
    { path: '/pricing', label: 'プラン' },
    { path: '/portfolio', label: '制作事例' },
    { path: '/flow', label: '制作の流れ' },
    { path: '/about', label: 'カタチ便について' },
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
                <Link to="/" className="kt-brand" aria-label="カタチ便ホーム">
                    <img src={doveLogo} alt="" className="kt-brand__logo" />
                    <span className="kt-brand__text">
                        <span className="kt-brand__name">カタチ便</span>
                        <span className="kt-brand__sub">岡崎真奈 / Okazaki Mana</span>
                    </span>
                </Link>

                <nav
                    className={`kt-nav${menuOpen ? ' kt-nav--open' : ''}`}
                    aria-label="サイトナビゲーション"
                >
                    {NAV_ITEMS.map(renderNavLink)}
                    <Link to="/pet" className="kt-nav__pp-mobile">
                        ペットグッズ専門 PAWS PRESS →
                    </Link>
                </nav>

                <div className="kt-header__actions">
                    <button
                        type="button"
                        className="kt-header__search"
                        onClick={() => setSearchOpenOnKey(location.key)}
                        aria-label="サイト内を探す"
                    >
                        <Search size={18} strokeWidth={2} aria-hidden="true" />
                    </button>
                    <Link to="/pet" className="kt-pawspress-link">
                        ペットグッズ専門 PAWS PRESS →
                    </Link>
                </div>

                <button
                    type="button"
                    className={`kt-burger${menuOpen ? ' kt-burger--open' : ''}`}
                    onClick={toggleMenu}
                    aria-label="メニュー"
                    aria-expanded={menuOpen}
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

            <SearchModal
                open={searchOpen}
                onClose={() => setSearchOpenOnKey(null)}
            />
        </header>
    );
}
