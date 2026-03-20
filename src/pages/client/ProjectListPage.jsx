import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FolderOpen, Clock, ArrowRight } from 'lucide-react';
import { PROJECT_STATUS_LABELS, formatPrice } from '../../lib/constants';
import './ProjectListPage.css';

// Demo data
const DEMO_PROJECTS = [
    {
        id: 'demo-1',
        title: 'ペットイラスト — ポチ',
        status: 'IN_PRODUCTION',
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        orders: { amount: 15000, status: 'paid' },
    },
    {
        id: 'demo-2',
        title: 'ペットイラスト — ミケ & タマ',
        status: 'DELIVERED',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        orders: { amount: 25000, status: 'paid' },
    },
];

export default function ProjectListPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, [user]);

    async function loadProjects() {
        try {
            if (user) {
                const { getProjectsByCustomer } = await import('../../lib/api');
                const data = await getProjectsByCustomer(user.id);
                setProjects(data);
            }
        } catch {
            setProjects(DEMO_PROJECTS);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="project-list-page">
            <div className="container">
                <div className="protected-loading">
                    <div className="protected-loading__spinner" />
                    <p>プロジェクトを読み込み中...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="project-list-page">
            <section className="plist-hero section">
                <div className="container">
                    <p className="plist-hero__badge">My Projects</p>
                    <h1 className="plist-hero__title">プロジェクト一覧</h1>
                    <p className="section-subtitle">ご注文のプロジェクト状況をご確認いただけます</p>
                </div>
            </section>

            <section className="plist-content section">
                <div className="container">
                    {projects.length === 0 ? (
                        <div className="plist-empty">
                            <FolderOpen size={48} strokeWidth={1} />
                            <h3>プロジェクトはまだありません</h3>
                            <p>ご注文後、プロジェクトがここに表示されます</p>
                            <Link to="/order" className="btn btn-primary">
                                注文する <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                        <div className="plist-grid">
                            {projects.map(project => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="plist-card"
                                >
                                    <div className="plist-card__header">
                                        <h3 className="plist-card__title">{project.title}</h3>
                                        <span className={`project-room__badge project-room__badge--${project.status.toLowerCase()}`}>
                                            {PROJECT_STATUS_LABELS[project.status]}
                                        </span>
                                    </div>
                                    <div className="plist-card__footer">
                                        <span className="plist-card__date">
                                            <Clock size={14} />
                                            {new Date(project.created_at).toLocaleDateString('ja-JP')}
                                        </span>
                                        {project.orders && (
                                            <span className="plist-card__amount">{formatPrice(project.orders.amount)}</span>
                                        )}
                                    </div>
                                    <span className="plist-card__arrow">→</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
