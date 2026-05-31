import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, FileText, CheckCircle, RefreshCw, Mail, JapaneseYen, Inbox } from 'lucide-react';
import './AdminDashboardPage.css';

const SOURCE_LABELS = {
    'kataribin-contact': 'カタチらぼ',
    'intake': '制作相談',
    'pawspress-contact': 'もふらぼ',
    'contact': 'お問い合わせ',
};
const ORDER_STATUS_LABELS = {
    new: 'New', quote: 'Quoted', in_progress: 'In Progress',
    revision: 'Revision', done: 'Done', pending: 'Pending', paid: 'Paid',
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        new: 0, quote: 0, in_progress: 0, done: 0, total: 0, revenue: 0,
        contactNew: 0, contactTotal: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentContacts, setRecentContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const countByStatus = async (status) => {
        const q = supabase.from('orders').select('*', { count: 'exact', head: true });
        const { count } = Array.isArray(status) ? await q.in('status', status) : await q.eq('status', status);
        return count || 0;
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [newC, quoteC, progressC, doneC] = await Promise.all([
                countByStatus('new'),
                countByStatus('quote'),
                countByStatus(['in_progress', 'revision']),
                countByStatus('done'),
            ]);

            // 総注文数
            const { count: totalC } = await supabase.from('orders').select('*', { count: 'exact', head: true });

            // 売上（done のみ合計）
            const { data: paidOrders } = await supabase.from('orders').select('amount').eq('status', 'done');
            const revenue = (paidOrders || []).reduce((sum, o) => sum + (o.amount || 0), 0);

            // 問い合わせ
            const { count: contactNewC } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new');
            const { count: contactTotalC } = await supabase.from('contacts').select('*', { count: 'exact', head: true });

            // 最近の注文・問い合わせ
            const { data: orders } = await supabase.from('orders').select('id,customer_name,category,status,amount,created_at').order('created_at', { ascending: false }).limit(5);
            const { data: contacts } = await supabase.from('contacts').select('id,source,name,status,created_at').order('created_at', { ascending: false }).limit(5);

            setStats({
                new: newC, quote: quoteC, in_progress: progressC, done: doneC,
                total: totalC || 0, revenue,
                contactNew: contactNewC || 0, contactTotal: contactTotalC || 0,
            });
            setRecentOrders(orders || []);
            setRecentContacts(contacts || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    if (loading) return <div className="admin-loading">読み込み中...</div>;

    const yen = (n) => '¥' + (n || 0).toLocaleString('ja-JP');

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1 className="admin-title">Dashboard</h1>
                <button className="btn btn-outline" onClick={fetchAll}>
                    <RefreshCw size={16} /> 更新
                </button>
            </div>

            {/* 統計カード */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card border-blue">
                    <div className="stat-icon bg-blue"><FileText size={24} /></div>
                    <div className="stat-info">
                        <h3>新規注文</h3>
                        <p className="stat-number">{stats.new}</p>
                    </div>
                </div>
                <div className="admin-stat-card border-orange">
                    <div className="stat-icon bg-orange"><LayoutDashboard size={24} /></div>
                    <div className="stat-info">
                        <h3>制作中</h3>
                        <p className="stat-number">{stats.in_progress}</p>
                    </div>
                </div>
                <div className="admin-stat-card border-green">
                    <div className="stat-icon bg-green"><CheckCircle size={24} /></div>
                    <div className="stat-info">
                        <h3>完了</h3>
                        <p className="stat-number">{stats.done}</p>
                    </div>
                </div>
                <div className="admin-stat-card border-purple">
                    <div className="stat-icon bg-purple"><Inbox size={24} /></div>
                    <div className="stat-info">
                        <h3>総注文数</h3>
                        <p className="stat-number">{stats.total}</p>
                    </div>
                </div>
                <div className="admin-stat-card border-teal">
                    <div className="stat-icon bg-teal"><JapaneseYen size={24} /></div>
                    <div className="stat-info">
                        <h3>売上（完了分）</h3>
                        <p className="stat-number stat-number--sm">{yen(stats.revenue)}</p>
                    </div>
                </div>
                <div className="admin-stat-card border-pink">
                    <div className="stat-icon bg-pink"><Mail size={24} /></div>
                    <div className="stat-info">
                        <h3>未対応の問い合わせ</h3>
                        <p className="stat-number">{stats.contactNew}<span className="stat-sub"> / {stats.contactTotal}</span></p>
                    </div>
                </div>
            </div>

            {/* 最近の注文・問い合わせ */}
            <div className="admin-recent-grid">
                <section className="admin-recent">
                    <div className="admin-recent__head">
                        <h2>最近の注文</h2>
                        <Link to="/admin/orders" className="admin-recent__more">すべて見る →</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="admin-recent__empty">注文はまだありません。</p>
                    ) : (
                        <ul className="admin-recent__list">
                            {recentOrders.map((o) => (
                                <li key={o.id} className="admin-recent__item">
                                    <Link to={`/admin/orders/${o.id}`}>
                                        <span className="admin-recent__name">{o.customer_name || '(名前なし)'}</span>
                                        <span className="admin-recent__meta">{o.category || '-'} ・ {yen(o.amount)}</span>
                                        <span className={`status-badge bg-gray admin-recent__status`}>{ORDER_STATUS_LABELS[o.status] || o.status}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-recent">
                    <div className="admin-recent__head">
                        <h2>最近の問い合わせ</h2>
                        <Link to="/admin/contacts" className="admin-recent__more">すべて見る →</Link>
                    </div>
                    {recentContacts.length === 0 ? (
                        <p className="admin-recent__empty">問い合わせはまだありません。</p>
                    ) : (
                        <ul className="admin-recent__list">
                            {recentContacts.map((c) => (
                                <li key={c.id} className="admin-recent__item">
                                    <Link to="/admin/contacts">
                                        <span className="admin-recent__name">{c.name || '(名前なし)'}</span>
                                        <span className="admin-recent__meta">{SOURCE_LABELS[c.source] || c.source} ・ {new Date(c.created_at).toLocaleDateString('ja-JP')}</span>
                                        {c.status === 'new' && <span className="status-badge bg-blue admin-recent__status">未対応</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
