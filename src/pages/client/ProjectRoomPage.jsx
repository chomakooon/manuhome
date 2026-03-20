import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatusTimeline from '../../components/portal/StatusTimeline';
import MessageThread from '../../components/portal/MessageThread';
import { ArrowLeft, Download, Image as ImageIcon, FileText, Clock } from 'lucide-react';
import { PROJECT_STATUS_LABELS, formatPrice, getFormKeyLabel, getFormValueLabel } from '../../lib/constants';
import './ProjectRoomPage.css';

// Demo data for when Supabase isn't connected
const DEMO_PROJECT = {
    id: 'demo-1',
    title: 'ペットイラスト — ポチ',
    status: 'IN_PRODUCTION',
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    orders: {
        amount: 15000,
        status: 'paid',
        tier_id: 'PLAN_LIGHT',
        selected_options: ['TEXT_LABEL'],
        form_data: { style_type: 'cute', pet_name: 'ポチ', usage_type: 'personal' }
    },
    project_files: [
        { id: 'f1', file_name: 'pochi_photo1.jpg', file_type: 'asset', file_url: '#', created_at: new Date().toISOString() },
        { id: 'f2', file_name: 'pochi_photo2.jpg', file_type: 'asset', file_url: '#', created_at: new Date().toISOString() },
    ],
    project_messages: [],
};

export default function ProjectRoomPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('status');

    useEffect(() => {
        loadProject();
    }, [id]);

    async function loadProject() {
        try {
            // Try to load from Supabase
            const { getProject } = await import('../../lib/api');
            const data = await getProject(id);
            setProject(data);
        } catch {
            // Fallback to demo data
            setProject(DEMO_PROJECT);
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMessage(content) {
        if (!user) return;
        try {
            const { sendMessage } = await import('../../lib/api');
            const msg = await sendMessage(project.id, user.id, content);
            setProject(prev => ({
                ...prev,
                project_messages: [...(prev.project_messages || []), msg],
            }));
        } catch (err) {
            // Demo mode: add locally
            const demoMsg = {
                id: Date.now().toString(),
                sender_id: user?.id || 'demo',
                content,
                created_at: new Date().toISOString(),
                profiles: { full_name: 'あなた', role: 'customer' },
            };
            setProject(prev => ({
                ...prev,
                project_messages: [...(prev.project_messages || []), demoMsg],
            }));
        }
    }

    if (loading) return (
        <div className="project-room">
            <div className="container">
                <div className="protected-loading">
                    <div className="protected-loading__spinner" />
                    <p>プロジェクトを読み込み中...</p>
                </div>
            </div>
        </div>
    );

    if (!project) return (
        <div className="project-room">
            <div className="container">
                <p>プロジェクトが見つかりません</p>
                <Link to="/projects" className="btn btn-outline">戻る</Link>
            </div>
        </div>
    );

    const assets = (project.project_files || []).filter(f => f.file_type === 'asset');
    const deliveries = (project.project_files || []).filter(f => f.file_type === 'delivery');

    const tabs = [
        { id: 'status', label: 'ステータス' },
        { id: 'assets', label: `素材 (${assets.length})` },
        { id: 'messages', label: `メッセージ` },
        { id: 'delivery', label: `納品 (${deliveries.length})` },
    ];

    return (
        <div className="project-room">
            <section className="project-room__hero section">
                <div className="container">
                    <Link to="/projects" className="project-room__back">
                        <ArrowLeft size={16} /> プロジェクト一覧に戻る
                    </Link>

                    <div className="project-room__header">
                        <div>
                            <h1 className="project-room__title">{project.title}</h1>
                            <div className="project-room__meta">
                                <span className={`project-room__badge project-room__badge--${project.status.toLowerCase()}`}>
                                    {PROJECT_STATUS_LABELS[project.status]}
                                </span>
                                <span className="project-room__date">
                                    <Clock size={14} />
                                    {new Date(project.created_at).toLocaleDateString('ja-JP')}
                                </span>
                                {project.orders && (
                                    <span className="project-room__amount">
                                        {formatPrice(project.orders.amount)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="project-room__content">
                <div className="container">
                    {/* Tabs */}
                    <div className="project-room__tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`project-room__tab ${activeTab === tab.id ? 'project-room__tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="project-room__panel">
                        {/* Status Tab */}
                        {activeTab === 'status' && (
                            <div className="project-room__status-panel">
                                <h3>プロジェクト進捗</h3>
                                <StatusTimeline currentStatus={project.status} />
                                <div className="project-room__info-grid">
                                    <div className="project-room__info-item">
                                        <span className="project-room__info-label">作成日</span>
                                        <span>{new Date(project.created_at).toLocaleDateString('ja-JP')}</span>
                                    </div>
                                    <div className="project-room__info-item">
                                        <span className="project-room__info-label">最終更新</span>
                                        <span>{new Date(project.updated_at).toLocaleDateString('ja-JP')}</span>
                                    </div>
                                    <div className="project-room__info-item">
                                        <span className="project-room__info-label">ステータス</span>
                                        <span>{PROJECT_STATUS_LABELS[project.status]}</span>
                                    </div>
                                    {project.orders && project.orders.tier_id && (
                                        <div className="project-room__info-item">
                                            <span className="project-room__info-label">プラン</span>
                                            <span>{project.orders.tier_id}</span>
                                        </div>
                                    )}
                                    {project.orders && project.orders.selected_options && project.orders.selected_options.length > 0 && (
                                        <div className="project-room__info-item">
                                            <span className="project-room__info-label">オプション</span>
                                            <span>{project.orders.selected_options.join(', ')}</span>
                                        </div>
                                    )}
                                    {project.orders && project.orders.form_data && Object.entries(project.orders.form_data).map(([key, value]) => {
                                        if (key.startsWith('consent_')) return null;
                                        return (
                                            <div key={key} className="project-room__info-item">
                                                <span className="project-room__info-label">{getFormKeyLabel(key)}</span>
                                                <span style={{ wordBreak: 'break-all' }}>{getFormValueLabel(key, value)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Assets Tab */}
                        {activeTab === 'assets' && (
                            <div className="project-room__files-panel">
                                <h3>アップロード済み素材</h3>
                                {assets.length === 0 ? (
                                    <p className="project-room__empty">素材はまだアップロードされていません</p>
                                ) : (
                                    <div className="project-room__file-grid">
                                        {assets.map(file => (
                                            <div key={file.id} className="project-room__file-card">
                                                <div className="project-room__file-icon">
                                                    <ImageIcon size={24} strokeWidth={1.5} />
                                                </div>
                                                <span className="project-room__file-name">{file.file_name}</span>
                                                <span className="project-room__file-date">
                                                    {new Date(file.created_at).toLocaleDateString('ja-JP')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages Tab */}
                        {activeTab === 'messages' && (
                            <div className="project-room__messages-panel">
                                <h3>メッセージ</h3>
                                <MessageThread
                                    messages={project.project_messages || []}
                                    onSend={handleSendMessage}
                                    currentUserId={user?.id}
                                />
                            </div>
                        )}

                        {/* Delivery Tab */}
                        {activeTab === 'delivery' && (
                            <div className="project-room__files-panel">
                                <h3>納品ファイル</h3>
                                {deliveries.length === 0 ? (
                                    <div className="project-room__empty-delivery">
                                        <FileText size={40} strokeWidth={1} />
                                        <p>納品ファイルはまだありません</p>
                                        <p className="project-room__empty-sub">制作完了後にこちらからダウンロードできます</p>
                                    </div>
                                ) : (
                                    <div className="project-room__delivery-list">
                                        {deliveries.map(file => (
                                            <a
                                                key={file.id}
                                                href={file.file_url}
                                                className="project-room__delivery-item"
                                                download
                                            >
                                                <FileText size={20} strokeWidth={1.5} />
                                                <div className="project-room__delivery-info">
                                                    <span>{file.file_name}</span>
                                                    <span className="project-room__file-date">
                                                        {new Date(file.created_at).toLocaleDateString('ja-JP')}
                                                    </span>
                                                </div>
                                                <Download size={16} />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
