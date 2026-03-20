import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, DollarSign, Users, TrendingUp } from 'lucide-react';
import { PROJECT_STATUS_LABELS, formatPrice } from '../../lib/constants';
import './DashboardPage.css';

// Demo stats
const DEMO_STATS = {
    totalProjects: 12,
    totalOrders: 8,
    totalRevenue: 185000,
    statusCounts: { NEW: 1, WAITING_ASSETS: 2, IN_PRODUCTION: 3, REVIEW: 1, DELIVERED: 4, CLOSED: 1 },
};

const DEMO_RECENT = [
    { id: 'r1', title: 'ペットイラスト — ポチ', status: 'IN_PRODUCTION', created_at: new Date(Date.now() - 86400000).toISOString(), profiles: { full_name: '田中花子' } },
    { id: 'r2', title: 'ペットイラスト — ミケ & タマ', status: 'NEW', created_at: new Date().toISOString(), profiles: { full_name: '鈴木一郎' } },
    { id: 'r3', title: 'ペットイラスト — チョコ', status: 'REVIEW', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), profiles: { full_name: '佐藤美咲' } },
];

export default function DashboardPage() {
    const [stats, setStats] = useState(DEMO_STATS);
    const [recent, setRecent] = useState(DEMO_RECENT);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const { getDashboardStats, getAllProjects } = await import('../../lib/api');
            const [statsData, projectsData] = await Promise.all([
                getDashboardStats(),
                getAllProjects(),
            ]);
            setStats(statsData);
            setRecent(projectsData.slice(0, 5));
        } catch {
            // keep demo data
        }
    }

    const statCards = [
        { icon: FolderKanban, label: '総プロジェクト', value: stats.totalProjects, color: '--color-text-primary' },
        { icon: DollarSign, label: '総売上', value: formatPrice(stats.totalRevenue), color: '--color-success' },
        { icon: Users, label: '受注数', value: stats.totalOrders, color: '--color-accent' },
        { icon: TrendingUp, label: '制作中', value: stats.statusCounts?.IN_PRODUCTION || 0, color: '--color-beige' },
    ];

    return (
        <div className="dash-page">
            <div className="dash-page__header">
                <h1 className="dash-page__title">ダッシュボード</h1>
                <p className="dash-page__sub">プロジェクトの概要と最近のアクティビティ</p>
            </div>

            {/* Stats Grid */}
            <div className="dash-stats">
                {statCards.map((s, i) => (
                    <div className="dash-stat" key={i}>
                        <div className="dash-stat__icon" style={{ color: `var(${s.color})` }}>
                            <s.icon size={22} strokeWidth={1.5} />
                        </div>
                        <div className="dash-stat__info">
                            <span className="dash-stat__value">{s.value}</span>
                            <span className="dash-stat__label">{s.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Breakdown */}
            <div className="dash-section">
                <h2 className="dash-section__title">ステータス別</h2>
                <div className="dash-status-grid">
                    {Object.entries(stats.statusCounts || {}).map(([status, count]) => (
                        <div className="dash-status-item" key={status}>
                            <span className={`project-room__badge project-room__badge--${status.toLowerCase()}`}>
                                {PROJECT_STATUS_LABELS[status]}
                            </span>
                            <span className="dash-status-count">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Projects */}
            <div className="dash-section">
                <div className="dash-section__header">
                    <h2 className="dash-section__title">最近のプロジェクト</h2>
                    <Link to="/dashboard/projects" className="dash-section__link">すべて見る →</Link>
                </div>
                <div className="dash-recent">
                    {recent.map(project => (
                        <Link
                            key={project.id}
                            to={`/dashboard/projects/${project.id}`}
                            className="dash-recent__item"
                        >
                            <div className="dash-recent__info">
                                <span className="dash-recent__title">{project.title}</span>
                                <span className="dash-recent__client">{project.profiles?.full_name || '—'}</span>
                            </div>
                            <span className={`project-room__badge project-room__badge--${project.status.toLowerCase()}`}>
                                {PROJECT_STATUS_LABELS[project.status]}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
