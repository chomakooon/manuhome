import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import PrivateAttachments from '../../components/portal/PrivateAttachments';
import { Filter } from 'lucide-react';
import './AdminOrderListPage.css';

const SOURCE_LABELS = {
    'kataribin-contact': 'カタチらぼ お問い合わせ',
    'intake': '制作相談',
    'pawspress-contact': 'もふらぼ お問い合わせ',
    'contact': 'お問い合わせ',
};

const STATUS_OPTIONS = [
    { value: 'new', label: '未対応', color: 'bg-blue' },
    { value: 'read', label: '確認済み', color: 'bg-yellow' },
    { value: 'replied', label: '返信済み', color: 'bg-green' },
];

export default function AdminContactListPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [notifyingId, setNotifyingId] = useState(null);
    const [notificationError, setNotificationError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            let query = supabase.from('contacts').select('*');
            if (filterStatus !== 'all') query = query.eq('status', filterStatus);
            query = query.order('created_at', { ascending: false });
            const { data, error } = await query;
            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setLoadError('お問い合わせの読み込みに失敗しました。');
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        // The external request and user-triggered retries share their loading state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchContacts();
    }, [fetchContacts]);

    const updateStatus = async (id, status) => {
        if (updatingId) return;
        setUpdatingId(id);
        setUpdateError('');
        try {
            const { data, error } = await supabase.from('contacts')
                .update({ status }).eq('id', id).select('id,status').single();
            if (error) throw error;
            setContacts(prev => prev
                .map(contact => contact.id === id ? { ...contact, status: data.status } : contact)
                .filter(contact => filterStatus === 'all' || contact.status === filterStatus));
        } catch (error) {
            console.error('Status update failed:', error);
            setUpdateError('ステータスを保存できませんでした。保存結果を確認できないため、再度お試しください。');
        } finally {
            setUpdatingId(null);
        }
    };

    const retryNotification = async (id) => {
        if (notifyingId) return;
        setNotifyingId(id);
        setNotificationError('');
        try {
            const { data, error } = await supabase.functions.invoke('retry-contact-notification', { body: { id } });
            if (error || data?.ok !== true || !['sent', 'disabled'].includes(data.notificationStatus)) {
                throw error || new Error('Notification was not sent');
            }
            setContacts(prev => prev.map(contact => contact.id === id
                ? { ...contact, notification_status: data.notificationStatus } : contact));
        } catch {
            setNotificationError('外部通知を送信できませんでした。お問い合わせは保存されています。時間をおいて再度お試しください。');
        } finally {
            setNotifyingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const s = STATUS_OPTIONS.find(o => o.value === status) || { label: status, color: 'bg-gray' };
        return <span className={`status-badge ${s.color}`}>{s.label}</span>;
    };

    return (
        <div className="admin-order-list">
            <div className="admin-header">
                <h1 className="admin-title">お問い合わせ</h1>
            </div>

            <div className="admin-filters">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input">
                        <option value="all">すべてのステータス</option>
                        <option value="new">未対応</option>
                        <option value="read">確認済み</option>
                        <option value="replied">返信済み</option>
                    </select>
                </div>
            </div>

            {updateError && <p role="alert">{updateError}</p>}
            {notificationError && <p role="alert">{notificationError}</p>}
            {loading ? (
                <div className="admin-loading">読み込み中...</div>
            ) : loadError ? (
                <div className="admin-loading" role="alert">
                    <p>{loadError}</p>
                    <button className="btn btn-outline" onClick={fetchContacts}>再読み込み</button>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>日時</th>
                                <th>送信元</th>
                                <th>お名前 / メール</th>
                                <th>内容</th>
                                <th>ステータス</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-400">お問い合わせはありません。</td>
                                </tr>
                            ) : (
                                contacts.map(c => (
                                    <tr key={c.id}>
                                        <td>{new Date(c.created_at).toLocaleString('ja-JP')}</td>
                                        <td>
                                            {SOURCE_LABELS[c.source] || c.source}
                                            {['pending', 'failed'].includes(c.notification_status) && (
                                                <div>
                                                    <p className="text-sm" role="status">問い合わせは保存済みです。外部通知は{c.notification_status === 'failed' ? '失敗' : '未送信'}です。</p>
                                                    <button type="button" className="btn btn-outline" disabled={notifyingId !== null} onClick={() => retryNotification(c.id)}>
                                                        {notifyingId === c.id ? '通知中…' : '外部通知を再送'}
                                                    </button>
                                                </div>
                                            )}
                                            {c.notification_status === 'disabled' && <p className="text-sm">外部通知は設定されていません。</p>}
                                            {c.notification_status === 'sent' && <p className="text-sm" role="status">外部通知を送信済みです。</p>}
                                        </td>
                                        <td>
                                            <strong>{c.name || '(名前なし)'}</strong><br />
                                            <span className="text-sm text-gray">{c.email || '-'}</span>
                                            {c.phone && <><br /><span className="text-sm text-gray">{c.phone}</span></>}
                                        </td>
                                        <td style={{ maxWidth: 360 }}>
                                            <button
                                                type="button"
                                                style={{
                                                    whiteSpace: 'pre-wrap',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: 0,
                                                    font: 'inherit',
                                                    color: 'inherit',
                                                    width: '100%',
                                                    ...(expandedId === c.id ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
                                                }}
                                                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                                                title="クリックで全文表示"
                                            >
                                                {c.message || '-'}
                                            </button>
                                            {c.metadata && Object.keys(c.metadata).length > 0 && expandedId === c.id && (
                                                <div>
                                                    <PrivateAttachments files={c.metadata.referencePhotos} />
                                                    <pre style={{ fontSize: 11, color: '#64748b', marginTop: 8, whiteSpace: 'pre-wrap' }}>
                                                        {JSON.stringify(c.metadata, (key, value) => key === 'referencePhotos' ? undefined : value, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {getStatusBadge(c.status)}
                                                <select
                                                    value={c.status}
                                                    disabled={updatingId !== null}
                                                    aria-label={`${c.name || 'お問い合わせ'}のステータス`}
                                                    onChange={e => updateStatus(c.id, e.target.value)}
                                                    className="form-input"
                                                    style={{ fontSize: 12, padding: '4px 6px' }}
                                                >
                                                    {STATUS_OPTIONS.map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
