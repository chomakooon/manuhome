import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
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
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from('contacts').select('*');
            if (filterStatus !== 'all') query = query.eq('status', filterStatus);
            query = query.order('created_at', { ascending: false });
            const { data, error } = await query;
            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const updateStatus = async (id, status) => {
        // 楽観的更新
        setContacts(prev => prev.map(c => (c.id === id ? { ...c, status } : c)));
        const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
        if (error) {
            console.error('status update failed:', error);
            fetchContacts(); // 失敗時は再取得して戻す
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

            {loading ? (
                <div className="admin-loading">読み込み中...</div>
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
                                        <td>{SOURCE_LABELS[c.source] || c.source}</td>
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
                                                <pre style={{ fontSize: 11, color: '#64748b', marginTop: 8, whiteSpace: 'pre-wrap' }}>
                                                    {JSON.stringify(c.metadata, null, 2)}
                                                </pre>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {getStatusBadge(c.status)}
                                                <select
                                                    value={c.status}
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
