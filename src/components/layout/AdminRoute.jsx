import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 管理画面用のルートガード。
 * - 未ログイン → /admin/login へ
 * - ログイン済みだが creator ロールでない → /admin/login へ（権限不足）
 */
export default function AdminRoute({ children }) {
    const { user, loading, isCreator } = useAuth();

    if (loading) {
        return (
            <div style={{ padding: '64px 20px', textAlign: 'center' }}>
                読み込み中...
            </div>
        );
    }

    if (!user || !isCreator) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
