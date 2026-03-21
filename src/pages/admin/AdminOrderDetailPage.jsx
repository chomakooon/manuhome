import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, User, Tag, Edit3, Settings } from 'lucide-react';
import './AdminOrderDetailPage.css';

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            setOrder(data);
            setStatus(data.status || 'new');
            setNotes(data.notes || '');
        } catch (error) {
            console.error('Error fetching order details:', error);
            // Optionally redirect if not found
            // navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status, notes })
                .eq('id', id);

            if (error) throw error;
            // Optimistic update
            setOrder({ ...order, status, notes });
            alert('Order updated successfully.');
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading Order Details...</div>;
    if (!order) return <div className="admin-loading">Order not found.</div>;

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

            <div className="detail-grid">
                {/* Left Column - View */}
                <div className="detail-col">
                    <div className="detail-card">
                        <h2><User size={18}/> Customer Info</h2>
                        <div className="card-content">
                            <p><strong>Name:</strong> {order.customer_name}</p>
                            <p><strong>Email:</strong> {order.customer_email}</p>
                        </div>
                    </div>

                    <div className="detail-card">
                        <h2><Tag size={18}/> Request Details</h2>
                        <div className="card-content">
                            <p><strong>Category:</strong> {order.category || '未入力'}</p>
                            <p><strong>SNS/Link:</strong> {order.sns_link || '未入力'}</p>
                            <p><strong>Usage:</strong> {order.usage || '未入力'}</p>
                            <p><strong>Deadline:</strong> {order.deadline || '未入力'}</p>
                            <div className="details-box">
                                {order.details || '詳細内容がありません。'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Edit */}
                <div className="detail-col">
                    <div className="detail-card edit-card">
                        <h2><Settings size={18}/> Management</h2>
                        <div className="card-content">
                            <div className="form-group">
                                <label>Status</label>
                                <select 
                                    className="form-input" 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="new">New</option>
                                    <option value="quote">Quoted</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="revision">Revision</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label><Edit3 size={16}/> Internal Notes (Hidden from customer)</label>
                                <textarea 
                                    className="form-input notes-input" 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)}
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
