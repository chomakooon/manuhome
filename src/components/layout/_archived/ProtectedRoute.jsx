import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requireCreator = false }) {
    const { user, profile, loading, isCreator } = useAuth();

    if (loading) {
        return (
            <div className="protected-loading">
                <div className="protected-loading__spinner" />
                <p>読み込み中...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireCreator && !isCreator) {
        return <Navigate to="/projects" replace />;
    }

    return children;
}
