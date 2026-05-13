/**
 * @file src/sites/kataribin/layout/KataribinFooter.jsx
 *
 * カタチ便用フッター。中央寄せ。
 */

import { Link } from 'react-router-dom';
import doveLogo from '../../../assets/pixel_art_dove.png';
import './KataribinFooter.css';

// Phase 12.5: フッターは情報過多 OK の方針で 8 項目化。
// 「カタチ便について」を追加し、補助機能の「ビジュアル診断」も併記する。
const FOOTER_LINKS = [
    { to: '/', label: 'ホーム' },
    { to: '/pricing', label: 'プラン' },
    { to: '/portfolio', label: '制作事例' },
    { to: '/flow', label: '制作の流れ' },
    { to: '/about', label: 'カタチ便について' },
    { to: '/diagnostic', label: 'ビジュアル診断' },
    { to: '/links', label: 'SNS・リンク' },
    { to: '/contact', label: 'お問い合わせ' },
];

export default function KataribinFooter() {
    return (
        <footer className="kt-footer">
            <div className="kt-footer__inner">
                <Link to="/" className="kt-footer__brand" aria-label="カタチ便ホーム">
                    <img src={doveLogo} alt="" className="kt-footer__logo" loading="lazy" />
                    <span className="kt-footer__brand-text">
                        <span className="kt-footer__name">カタチ便</span>
                        <span className="kt-footer__sub">
                            岡崎真奈 / <span lang="en">Okazaki Mana</span>
                        </span>
                    </span>
                </Link>

                <nav className="kt-footer__nav" aria-label="フッターナビゲーション">
                    {FOOTER_LINKS.map((l) => (
                        <Link key={l.to} to={l.to} className="kt-footer__link">
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <Link to="/pet" className="kt-footer__pp">
                    ペットグッズ専門 <span lang="en">PAWS PRESS</span> →
                </Link>

                <p className="kt-footer__copy">© 2026 カタチ便 / 岡崎真奈</p>
            </div>
        </footer>
    );
}
