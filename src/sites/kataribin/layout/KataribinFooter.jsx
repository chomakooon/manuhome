/**
 * @file src/sites/kataribin/layout/KataribinFooter.jsx
 *
 * カタチ便用フッター。中央寄せ。
 */

import { Link } from 'react-router-dom';
import doveLogo from '../../../assets/pixel_art_dove.png';
import './KataribinFooter.css';

const FOOTER_LINKS = [
    { to: '/', label: 'ホーム' },
    { to: '/#pricing', label: 'プラン' },
    { to: '/portfolio', label: '制作事例' },
    { to: '/#flow', label: '制作の流れ' },
    { to: '/diagnostic', label: 'ビジュアル診断' },
    { to: '/links', label: 'SNS・リンク' },
    { to: '/intake', label: 'お問い合わせ' },
];

export default function KataribinFooter() {
    return (
        <footer className="kt-footer">
            <div className="kt-footer__inner">
                <Link to="/" className="kt-footer__brand" aria-label="カタチ便ホーム">
                    <img src={doveLogo} alt="" className="kt-footer__logo" />
                    <span className="kt-footer__brand-text">
                        <span className="kt-footer__name">カタチ便</span>
                        <span className="kt-footer__sub">岡崎真奈 / Okazaki Mana</span>
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
                    ペットグッズ専門 PAWS PRESS →
                </Link>

                <p className="kt-footer__copy">© 2026 カタチ便 / 岡崎真奈</p>
            </div>
        </footer>
    );
}
