import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut } from 'lucide-react';
import Icon from '../common/Icon';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
        } finally {
            navigate('/admin/login', { replace: true });
        }
    };

    const navItems = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/orders', icon: FileText, label: 'Orders' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__header">
                    <span className="admin-sidebar__logo">
                        <Icon name="Package" color="var(--color-accent)" size={24} />
                    </span>
                    <div>
                        <h2 className="admin-sidebar__title">Admin</h2>
                        <p className="admin-sidebar__role">Katachi-ben OS</p>
                    </div>
                </div>

                <nav className="admin-sidebar__nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                            }
                        >
                            <item.icon size={18} strokeWidth={1.5} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <button className="admin-sidebar__logout" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
