import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, FolderKanban, Mail, LogOut } from 'lucide-react';
import Icon from '../common/Icon';
import './DashboardLayout.css';

export default function DashboardLayout() {
    const { user, profile, loading, isCreator, signOut } = useAuth();

    if (loading) return (
        <div className="protected-loading">
            <div className="protected-loading__spinner" />
            <p>読み込み中...</p>
        </div>
    );

    if (!user || !isCreator) return <Navigate to="/login" replace />;

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: '概要', end: true },
        { to: '/dashboard/projects', icon: FolderKanban, label: 'プロジェクト' },
        { to: '/dashboard/mailing', icon: Mail, label: 'メーリングリスト' },
    ];

    return (
        <div className="dash-layout">
            <aside className="dash-sidebar">
                <div className="dash-sidebar__header">
                    <span className="dash-sidebar__logo">
                        <Icon name="Package" color="var(--color-accent)" size={24} />
                    </span>
                    <div>
                        <h2 className="dash-sidebar__title">カタチ便</h2>
                        <p className="dash-sidebar__role">クリエイターダッシュボード</p>
                    </div>
                </div>

                <nav className="dash-sidebar__nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `dash-sidebar__link ${isActive ? 'dash-sidebar__link--active' : ''}`
                            }
                        >
                            <item.icon size={18} strokeWidth={1.5} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="dash-sidebar__footer">
                    <div className="dash-sidebar__user">
                        <span className="dash-sidebar__avatar">
                            {(profile?.full_name || 'C').charAt(0)}
                        </span>
                        <span className="dash-sidebar__name">{profile?.full_name || 'Creator'}</span>
                    </div>
                    <button className="dash-sidebar__logout" onClick={signOut}>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            <main className="dash-main">
                <Outlet />
            </main>
        </div>
    );
}
