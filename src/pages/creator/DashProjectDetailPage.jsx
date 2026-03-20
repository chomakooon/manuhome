import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatusTimeline from '../../components/portal/StatusTimeline';
import MessageThread from '../../components/portal/MessageThread';
import FileUpload from '../../components/portal/FileUpload';
import { ArrowLeft, Save, Upload, Loader } from 'lucide-react';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER, formatPrice, getFormKeyLabel, getFormValueLabel } from '../../lib/constants';
import './DashProjectDetailPage.css';

// Demo data
const DEMO_PROJECT = {
    id: 'demo-1',
    title: 'ペットイラスト — ポチ',
    status: 'IN_PRODUCTION',
    notes: 'かわいいポーズでお願いします。',
    created_at: new Date(Date.now() - 86400000).toISOString(),
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
    ],
    project_messages: [],
    customer_id: 'customer-demo',
};

export default function DashProjectDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notes, setNotes] = useState('');
    const [deliveryFiles, setDeliveryFiles] = useState([]);

    useEffect(() => {
        loadProject();
    }, [id]);

    async function loadProject() {
        try {
            const { getProject } = await import('../../lib/api');
            const data = await getProject(id);
            setProject(data);
            setNotes(data.notes || '');
        } catch {
            setProject(DEMO_PROJECT);
            setNotes(DEMO_PROJECT.notes || '');
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(newStatus) {
        try {
            const { updateProjectStatus } = await import('../../lib/api');
            await updateProjectStatus(project.id, newStatus);
            setProject(prev => ({ ...prev, status: newStatus }));
        } catch {
            setProject(prev => ({ ...prev, status: newStatus }));
        }
    }

    async function handleSaveNotes() {
        setSaving(true);
        try {
            const { updateProjectNotes } = await import('../../lib/api');
            await updateProjectNotes(project.id, notes);
        } catch {
            // silently continue in demo mode
        } finally {
            setSaving(false);
        }
    }

    async function handleSendMessage(content) {
        try {
            const { sendMessage } = await import('../../lib/api');
            const msg = await sendMessage(project.id, user.id, content);
            setProject(prev => ({
                ...prev,
                project_messages: [...(prev.project_messages || []), msg],
            }));
        } catch {
            const demoMsg = {
                id: Date.now().toString(),
                sender_id: user?.id || 'creator',
                content,
                created_at: new Date().toISOString(),
                profiles: { full_name: 'クリエイター', role: 'creator' },
            };
            setProject(prev => ({
                ...prev,
                project_messages: [...(prev.project_messages || []), demoMsg],
            }));
        }
    }

    async function handleDeliveryUpload() {
        if (deliveryFiles.length === 0) return;
        setSaving(true);
        try {
            const { uploadProjectFile } = await import('../../lib/api');
            for (const f of deliveryFiles) {
                await uploadProjectFile(project.id, f.file, 'delivery', user.id);
            }
            setDeliveryFiles([]);
            loadProject();
        } catch {
            // demo mode
            setDeliveryFiles([]);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="dash-page">
            <div className="protected-loading">
                <div className="protected-loading__spinner" />
            </div>
        </div>
    );

    if (!project) return (
        <div className="dash-page">
            <p>プロジェクトが見つかりません</p>
        </div>
    );

    const assets = (project.project_files || []).filter(f => f.file_type === 'asset');
    const deliveries = (project.project_files || []).filter(f => f.file_type === 'delivery');
    const currentStatusIndex = PROJECT_STATUS_ORDER.indexOf(project.status);

    return (
        <div className="dash-page dashpd">
            <Link to="/dashboard/projects" className="dashpd__back">
                <ArrowLeft size={16} /> プロジェクト一覧に戻る
            </Link>

            <div className="dashpd__header">
                <h1 className="dash-page__title">{project.title}</h1>
                <div className="dashpd__meta">
                    <span className={`project-room__badge project-room__badge--${project.status.toLowerCase()}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                    {project.orders && (
                        <span className="dashpd__amount">{formatPrice(project.orders.amount)}</span>
                    )}
                </div>
            </div>

            {/* Status Timeline + Control */}
            <div className="dashpd__section">
                <h2 className="dashpd__section-title">ステータス管理</h2>
                <StatusTimeline currentStatus={project.status} />
                <div className="dashpd__status-controls">
                    {PROJECT_STATUS_ORDER.map((status, i) => (
                        <button
                            key={status}
                            className={`dashpd__status-btn ${project.status === status ? 'dashpd__status-btn--active' : ''}`}
                            onClick={() => handleStatusChange(status)}
                            disabled={project.status === status}
                        >
                            {PROJECT_STATUS_LABELS[status]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="dashpd__grid">
                {/* Left Column */}
                <div className="dashpd__col">
                    {/* Assets */}
                    <div className="dashpd__section">
                        <h2 className="dashpd__section-title">クライアント素材 ({assets.length})</h2>
                        {assets.length === 0 ? (
                            <p className="dashpd__empty">素材なし</p>
                        ) : (
                            <div className="dashpd__file-list">
                                {assets.map(f => (
                                    <div key={f.id} className="dashpd__file-item">
                                        <span>{f.file_name}</span>
                                        <span className="dashpd__file-date">
                                            {new Date(f.created_at).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Delivery Upload */}
                    <div className="dashpd__section">
                        <h2 className="dashpd__section-title">納品ファイルアップロード</h2>
                        <FileUpload
                            files={deliveryFiles}
                            onChange={setDeliveryFiles}
                            maxFiles={10}
                            accept="*/*"
                        />
                        {deliveryFiles.length > 0 && (
                            <button
                                className="btn btn-primary dashpd__upload-btn"
                                onClick={handleDeliveryUpload}
                                disabled={saving}
                            >
                                {saving ? <Loader size={16} className="spin" /> : <Upload size={16} />}
                                納品ファイルをアップロード
                            </button>
                        )}

                        {deliveries.length > 0 && (
                            <div className="dashpd__file-list" style={{ marginTop: 'var(--space-md)' }}>
                                <p className="dashpd__section-subtitle">アップロード済み納品ファイル</p>
                                {deliveries.map(f => (
                                    <div key={f.id} className="dashpd__file-item">
                                        <span>{f.file_name}</span>
                                        <span className="dashpd__file-date">
                                            {new Date(f.created_at).toLocaleDateString('ja-JP')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="dashpd__col">
                    {/* Notes */}
                    <div className="dashpd__section">
                        <h2 className="dashpd__section-title">制作メモ</h2>
                        <textarea
                            className="form-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="制作に関するメモ..."
                            rows={4}
                        />
                        <button
                            className="btn btn-outline dashpd__save-btn"
                            onClick={handleSaveNotes}
                            disabled={saving}
                        >
                            {saving ? <Loader size={14} className="spin" /> : <Save size={14} />}
                            メモを保存
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="dashpd__section">
                        <h2 className="dashpd__section-title">クライアントメッセージ</h2>
                        <MessageThread
                            messages={project.project_messages || []}
                            onSend={handleSendMessage}
                            currentUserId={user?.id}
                        />
                    </div>

                    {/* Order Info */}
                    {project.orders && (
                        <div className="dashpd__section">
                            <h2 className="dashpd__section-title">注文情報</h2>
                            <div className="dashpd__info-grid">
                                <div className="dashpd__info-item">
                                    <span className="dashpd__info-label">金額</span>
                                    <span>{formatPrice(project.orders.amount)}</span>
                                </div>
                                <div className="dashpd__info-item">
                                    <span className="dashpd__info-label">支払い状況</span>
                                    <span>{project.orders.status === 'paid' ? '支払い済み' : '未払い'}</span>
                                </div>
                                {project.orders.tier_id && (
                                    <div className="dashpd__info-item">
                                        <span className="dashpd__info-label">プラン</span>
                                        <span>{project.orders.tier_id}</span>
                                    </div>
                                )}
                                {project.orders.selected_options && project.orders.selected_options.length > 0 && (
                                    <div className="dashpd__info-item">
                                        <span className="dashpd__info-label">オプション</span>
                                        <span>{project.orders.selected_options.join(', ')}</span>
                                    </div>
                                )}
                                {project.orders.form_data && Object.entries(project.orders.form_data).map(([key, value]) => {
                                    if (key.startsWith('consent_')) return null;
                                    return (
                                        <div key={key} className="dashpd__info-item">
                                            <span className="dashpd__info-label">{getFormKeyLabel(key)}</span>
                                            <span style={{ wordBreak: 'break-all' }}>{getFormValueLabel(key, value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
