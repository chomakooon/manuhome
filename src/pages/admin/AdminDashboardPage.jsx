import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
    const [counts, setCounts] = useState({ new: 0, in_progress: 0, done: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        setLoading(true);
        try {
            // New Orders
            const { count: newCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'new');
            
            // In Progress (including revision)
            const { count: progressCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['in_progress', 'revision']);
            
            // Done
            const { count: doneCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'done');

            setCounts({
                new: newCount || 0,
                in_progress: progressCount || 0,
                done: doneCount || 0
            });
        } catch (error) {
            console.error('Error fetching dashboard counts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1 className="admin-title">Dashboard</h1>
                <button className="btn btn-outline" onClick={fetchCounts}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card border-blue">
                    <div className="stat-icon bg-blue"><FileText size={24} /></div>
                    <div className="stat-info">
                        <h3>New Orders</h3>
                        <p className="stat-number">{counts.new}</p>
                    </div>
                </div>

                <div className="admin-stat-card border-orange">
                    <div className="stat-icon bg-orange"><LayoutDashboard size={24} /></div>
                    <div className="stat-info">
                        <h3>In Progress</h3>
                        <p className="stat-number">{counts.in_progress}</p>
                    </div>
                </div>

                <div className="admin-stat-card border-green">
                    <div className="stat-icon bg-green"><CheckCircle size={24} /></div>
                    <div className="stat-info">
                        <h3>Completed</h3>
                        <p className="stat-number">{counts.done}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
