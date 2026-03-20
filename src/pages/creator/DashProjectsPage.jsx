import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER, formatPrice } from '../../lib/constants';
import './DashProjectsPage.css';

// Demo data
const DEMO_PROJECTS = [
    { id: 'd1', title: 'ペットイラスト — ポチ', status: 'IN_PRODUCTION', created_at: new Date(Date.now() - 86400000).toISOString(), orders: { amount: 15000, status: 'paid' }, profiles: { full_name: '田中花子', company: '' } },
    { id: 'd2', title: 'ペットイラスト — ミケ & タマ', status: 'NEW', created_at: new Date().toISOString(), orders: { amount: 25000, status: 'paid' }, profiles: { full_name: '鈴木一郎', company: '株式会社サンプル' } },
    { id: 'd3', title: 'ペットイラスト — チョコ', status: 'REVIEW', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), orders: { amount: 15000, status: 'paid' }, profiles: { full_name: '佐藤美咲', company: '' } },
    { id: 'd4', title: 'ペットイラスト — ソラ', status: 'DELIVERED', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), orders: { amount: 15000, status: 'paid' }, profiles: { full_name: '高橋太郎', company: '' } },
    { id: 'd5', title: 'ペットイラスト — モカ & ラテ', status: 'CLOSED', created_at: new Date(Date.now() - 30 * 86400000).toISOString(), orders: { amount: 25000, status: 'paid' }, profiles: { full_name: '山本真理', company: '' } },
];

export default function DashProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        try {
            const { getAllProjects } = await import('../../lib/api');
            const data = await getAllProjects();
            setProjects(data);
        } catch {
            setProjects(DEMO_PROJECTS);
        } finally {
            setLoading(false);
        }
    }

    const filteredProjects = projects
        .filter(p => filter === 'all' || p.status === filter)
        .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="dash-page">
            <div className="protected-loading">
                <div className="protected-loading__spinner" />
            </div>
        </div>
    );

    return (
        <div className="dash-page">
            <div className="dash-page__header">
                <h1 className="dash-page__title">プロジェクト管理</h1>
                <p className="dash-page__sub">全プロジェクトの一覧と管理</p>
            </div>

            {/* Controls */}
            <div className="dashp-controls">
                <div className="dashp-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="プロジェクト名、クライアント名で検索..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="dashp-filters">
                    <button
                        className={`dashp-filter-btn ${filter === 'all' ? 'dashp-filter-btn--active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        すべて ({projects.length})
                    </button>
                    {PROJECT_STATUS_ORDER.map(status => {
                        const count = projects.filter(p => p.status === status).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={status}
                                className={`dashp-filter-btn ${filter === status ? 'dashp-filter-btn--active' : ''}`}
                                onClick={() => setFilter(status)}
                            >
                                {PROJECT_STATUS_LABELS[status]} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Project Table */}
            <div className="dashp-table-wrap">
                <table className="dashp-table">
                    <thead>
                        <tr>
                            <th>プロジェクト</th>
                            <th>クライアント</th>
                            <th>ステータス</th>
                            <th>金額</th>
                            <th>作成日</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id}>
                                <td>
                                    <Link to={`/dashboard/projects/${project.id}`} className="dashp-table__link">
                                        {project.title}
                                    </Link>
                                </td>
                                <td>
                                    <span className="dashp-table__client">{project.profiles?.full_name || '—'}</span>
                                    {project.profiles?.company && (
                                        <span className="dashp-table__company">{project.profiles.company}</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`project-room__badge project-room__badge--${project.status.toLowerCase()}`}>
                                        {PROJECT_STATUS_LABELS[project.status]}
                                    </span>
                                </td>
                                <td className="dashp-table__amount">
                                    {project.orders ? formatPrice(project.orders.amount) : '—'}
                                </td>
                                <td className="dashp-table__date">
                                    {new Date(project.created_at).toLocaleDateString('ja-JP')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProjects.length === 0 && (
                    <div className="dashp-empty">
                        <p>条件に一致するプロジェクトはありません</p>
                    </div>
                )}
            </div>
        </div>
    );
}
