import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Eye } from 'lucide-react';
import './AdminOrderListPage.css';

export default function AdminOrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchOrders();
    }, [filterStatus, sortOrder]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let query = supabase.from('orders').select('*');
            
            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }
            
            query = query.order('created_at', { ascending: sortOrder === 'asc' });

            const { data, error } = await query;
            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            'new': { label: 'New', color: 'bg-blue' },
            'quote': { label: 'Quoted', color: 'bg-yellow' },
            'in_progress': { label: 'In Progress', color: 'bg-orange' },
            'revision': { label: 'Revision', color: 'bg-purple' },
            'done': { label: 'Done', color: 'bg-green' }
        };
        const s = statuses[status] || { label: status, color: 'bg-gray' };
        return <span className={`status-badge ${s.color}`}>{s.label}</span>;
    };

    return (
        <div className="admin-order-list">
            <div className="admin-header">
                <h1 className="admin-title">Orders</h1>
            </div>

            <div className="admin-filters">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-input">
                        <option value="all">All Statuses</option>
                        <option value="new">New</option>
                        <option value="quote">Quoted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="revision">Revision</option>
                        <option value="done">Done</option>
                    </select>
                </div>
                
                <div className="filter-group">
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="form-input">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading">Loading orders...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Client</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-400">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <strong>{order.customer_name}</strong><br/>
                                            <span className="text-sm text-gray">{order.customer_email}</span>
                                        </td>
                                        <td>{order.category || 'N/A'}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>
                                            <Link to={`/admin/orders/${order.id}`} className="btn-icon">
                                                <Eye size={18} />
                                            </Link>
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
