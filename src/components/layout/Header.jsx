import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, LayoutDashboard } from 'lucide-react';
import Icon from '../common/Icon';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const { user, isCreator } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navItems = [
    { path: '/', label: 'TOP' },
    { path: '/services', label: 'できること' },
    { path: '/portfolio', label: '制作事例' },
    { path: '/diagnostic', label: 'ビジュアル診断' },
    { path: '/order', label: '注文' },
    { path: '/about', label: 'クリエイター情報' },
    { path: '/links', label: 'SNS・リンク' },
  ];

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">
            <Icon name="Package" color="var(--color-accent)" size={24} />
          </span>
          <span className="header__logo-text">かたち便</span>
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`} ref={menuRef}>
          <ul className="header__menu">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`header__link ${location.pathname === item.path ? 'header__link--active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          {user ? (
            <>
              {isCreator ? (
                <Link to="/dashboard" className="header__auth-btn" title="ダッシュボード">
                  <LayoutDashboard size={18} strokeWidth={1.5} />
                </Link>
              ) : (
                <Link to="/projects" className="header__auth-btn" title="マイページ">
                  <User size={18} strokeWidth={1.5} />
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" className="header__auth-btn" title="ログイン">
              <User size={18} strokeWidth={1.5} />
            </Link>
          )}

          <Link to="/intake" className="header__cta btn btn-primary">
            制作相談
          </Link>
        </div>

        <button
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && <div className="header__overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
