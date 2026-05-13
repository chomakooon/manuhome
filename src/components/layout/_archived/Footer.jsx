import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import './Footer.css';

export default function Footer() {
    const socialLinks = [
        { label: 'Instagram', url: '#', icon: 'Instagram' },
        { label: 'X', url: '#', icon: 'Twitter' },
        { label: 'note', url: '#', icon: 'NotebookPen' },
        { label: 'LINE', url: '#', icon: 'MessageCircle' },
    ];

    return (
        <footer className="footer">
            <div className="footer__inner container">
                <div className="footer__top">
                    <div className="footer__brand">
                        <Link to="/" className="footer__logo">
                            <span className="footer__logo-icon">
                                <Icon name="Package" color="var(--color-accent)" size={24} />
                            </span>
                            かたち便
                        </Link>
                        <p className="footer__tagline">
                            イメージをカタチにして届ける<br />
                            ビジュアルコミュニケーション・スタジオ
                        </p>
                    </div>

                    <div className="footer__links">
                        <div className="footer__col">
                            <ul className="footer__nav">
                            <li><a href="/">TOP</a></li>
                            <li><a href="/#features">できること</a></li>
                            <li><a href="/portfolio">制作事例</a></li>
                            <li><a href="/about">クリエイター情報</a></li>
                            <li><a href="/#links">SNS・リンク</a></li>
                        </ul>
                        </div>
                        <div className="footer__col">
                            <h4 className="footer__col-title">その他</h4>
                            <ul>
                                <li><Link to="/intake">お問い合わせ</Link></li>
                                <li><Link to="/links">SNS・リンク</Link></li>
                                <li><a href="#">プライバシーポリシー</a></li>
                                <li><a href="#">特定商取引法</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer__social">
                    {socialLinks.map((s) => (
                        <a key={s.label} href={s.url} className="footer__social-link" aria-label={s.label}>
                            <Icon name={s.icon} color="white" size={20} />
                        </a>
                    ))}
                </div>

                <div className="footer__bottom">
                    <p>&copy; {new Date().getFullYear()} カタチ便 All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
