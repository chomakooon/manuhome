import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, User, Tag, Edit3, Settings } from 'lucide-react';
import PrivateAttachments from '../../components/portal/PrivateAttachments';
import './AdminOrderDetailPage.css';

const WORKFLOW_STATUSES = [
    ['new', 'New'], ['quote', 'Quoted'], ['in_progress', 'In Progress'],
    ['revision', 'Revision'], ['done', 'Done'],
];

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [saveError, setSaveError] = useState('');
    const [saved, setSaved] = useState(false);

    // Form states
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState('');

    const fetchOrderDetails = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        setSaved(false);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*,order_internal_notes(notes)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data);
            setStatus(data.status || '');
            setNotes(data.order_internal_notes?.notes || '');
        } catch (error) {
            console.error('Error fetching order details:', error);
            setLoadError('注文を読み込めませんでした。アクセス権と注文番号をご確認ください。');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        // The external request and user-triggered retries share their loading state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        setSaveError('');
        setSaved(false);
        let statusSaved = false;
        try {
            if (status !== order.status) {
                if (!WORKFLOW_STATUSES.some(([value]) => value === status)) {
                    throw new Error('Invalid workflow status');
                }
                const { data, error } = await supabase.from('orders')
                    .update({ status }).eq('id', id).select('id,status').single();
                if (error) throw error;
                setOrder(previous => ({ ...previous, status: data.status }));
                setStatus(data.status);
                statusSaved = true;
            }
            const { data, error } = await supabase.from('order_internal_notes')
                .upsert({ order_id: id, notes, updated_at: new Date().toISOString() })
                .select('notes').single();
            if (error) throw error;
            setNotes(data.notes || '');
            setOrder(previous => ({ ...previous, order_internal_notes: { notes: data.notes } }));
            setSaved(true);
        } catch (error) {
            console.error('Error updating order:', error);
            setSaveError(statusSaved
                ? 'ステータスは保存済みですが、メモの保存に失敗しました。メモの入力内容は保持されています。再度お試しください。'
                : '保存に失敗しました。入力内容は保持されています。再度お試しください。');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-loading">注文を読み込み中...</div>;
    if (loadError) return (
        <div className="admin-loading" role="alert">
            <p>{loadError}</p>
            <button className="btn btn-outline" onClick={fetchOrderDetails}>再読み込み</button>
            <Link to="/admin/orders" className="back-link">注文一覧に戻る</Link>
        </div>
    );
    if (!order) return <div className="admin-loading">注文が見つかりません。</div>;

    const form = order.form_data && typeof order.form_data === 'object' ? order.form_data : {};
    const customer = form.customer || {};
    const currentStatusIsWorkflow = WORKFLOW_STATUSES.some(([value]) => value === order.status);
    const paymentStatus = { unpaid: '未払い', paid: '支払済み', failed: '決済失敗', refunded: '返金済み' }[order.payment_status] || '未確認';
    const publishingPermission = form.photoPublishingOptOut === true ? '掲載不可'
        : form.photoPublishingOptOut === false ? '掲載拒否なし' : '未確認';

    return (
        <div className="admin-order-detail">
            <div className="admin-header">
                <div>
                    <Link to="/admin/orders" className="back-link">
                        <ArrowLeft size={16} /> Back to Orders
                    </Link>
                    <h1 className="admin-title">Order #{order.id.slice(0,8)}</h1>
                    <span className="text-gray text-sm">Created on {new Date(order.created_at).toLocaleString()}</span>
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={handleSave} 
                    disabled={saving}
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {saveError && <p role="alert" className="admin-save-error">{saveError}</p>}
            {saved && <p role="status">変更を保存しました。</p>}
            <div className="detail-grid">
                {/* Left Column - View */}
                <div className="detail-col">
                    <div className="detail-card">
                        <h2><User size={18}/> Customer Info</h2>
                        <div className="card-content">
                            <p><strong>お名前:</strong> {order.customer_name || customer.name || '未入力'}</p>
                            <p><strong>メール:</strong> {order.customer_email || customer.email || '未入力'}</p>
                            <p><strong>電話番号:</strong> {customer.phone || '未入力'}</p>
                            <p><strong>郵便番号:</strong> {customer.postalCode || '未入力'}</p>
                            <p><strong>配送先住所:</strong> {customer.address || '未入力'}</p>
                            <p><strong>ペットのお名前:</strong> {customer.petName || '未入力'}</p>
                            <p><strong>ペットの種類・特徴:</strong> {customer.petDetail || '未入力'}</p>
                            <p className="details-box"><strong>備考:</strong> {customer.note || '未入力'}</p>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h2><Tag size={18}/> Request Details</h2>
                        <div className="card-content">
                            <p><strong>プラン:</strong> {form.planId || order.category || '未入力'}</p>
                            <p><strong>支払い状態:</strong> {paymentStatus}</p>
                            <p><strong>金額:</strong> ¥{(order.amount ?? 0).toLocaleString('ja-JP')}</p>
                            <p><strong>グッズ:</strong> {Array.isArray(form.goodsTypes) ? form.goodsTypes.join(' / ') : '未入力'}</p>
                            <p><strong>グッズの詳細:</strong> {Array.isArray(form.goodsDetails) ? form.goodsDetails.join(' / ') : '未入力'}</p>
                            <p><strong>絵柄:</strong> {form.artStyle || '未入力'} {form.customStyle || ''}</p>
                            <p><strong>ギフト包装:</strong> {form.giftWrap ? 'あり' : 'なし'}</p>
                            <p className="details-box"><strong>ギフトメッセージ:</strong> {form.giftMessage || 'なし'}</p>
                            <p><strong>写真のSNS・HP掲載:</strong> {publishingPermission}</p>
                            <p><strong>紹介コード:</strong> {form.referralCode || 'なし'}</p>
                            <p><strong>SNS/Link:</strong> {order.sns_link || '未入力'}</p>
                            <p><strong>Usage:</strong> {order.usage || '未入力'}</p>
                            <p><strong>Deadline:</strong> {order.deadline || '未入力'}</p>
                            <div className="details-box">
                                {order.details || '詳細内容がありません。'}
                            </div>
                        </div>
                    </div>
                    <div className="detail-card">
                        <h2>お預かりした写真・参考画像</h2>
                        <div className="card-content">
                            <h3>ペットのお写真</h3>
                            <PrivateAttachments files={form.photos} />
                            <h3>絵柄の参考画像</h3>
                            <PrivateAttachments files={form.styleReferences} />
                        </div>
                    </div>
                </div>

                {/* Right Column - Edit */}
                <div className="detail-col">
                    <div className="detail-card edit-card">
                        <h2><Settings size={18}/> Management</h2>
                        <div className="card-content">
                            <div className="form-group">
                                <label htmlFor="admin-order-status">Status</label>
                                <select
                                    id="admin-order-status"
                                    className="form-input"
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setSaved(false); }}
                                    disabled={saving || order.status === 'pending'}
                                >
                                    {!currentStatusIsWorkflow && <option value={order.status || ''}>{order.status || '未設定'}（現在）</option>}
                                    {WORKFLOW_STATUSES.map(([value, label]) => (
                                        <option key={value} value={value} disabled={['in_progress', 'revision', 'done'].includes(value) && order.payment_status !== 'paid'}>{label}</option>
                                    ))}
                                </select>
                                <p>支払い状態は決済システムで確認されます。未払いの注文は制作状態を変更できません。</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="admin-order-notes"><Edit3 size={16}/> Internal Notes (Hidden from customer)</label>
                                <textarea
                                    id="admin-order-notes"
                                    className="form-input notes-input"
                                    value={notes}
                                    onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
                                    disabled={saving}
                                    placeholder="Add preparation notes, drafts links, etc."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
