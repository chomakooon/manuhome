import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 管理画面ログイン（メール + パスワード）。
 * creator ロールのユーザーのみ /admin にアクセスできる。
 * ログイン成功かつ creator なら /admin へ遷移。
 */
export default function AdminLoginPage() {
    const { signInWithPassword, user, isCreator, loading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 既にログイン済み(creator)なら /admin へ
    useEffect(() => {
        if (!loading && user && isCreator) {
            navigate('/admin', { replace: true });
        }
    }, [loading, user, isCreator, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await signInWithPassword(email.trim(), password);
            // onAuthStateChange → profile取得後、上のuseEffectが /admin へ遷移
            // 念のため少し待ってから判定（profile未取得で弾かれないように）
        } catch {
            setError('ログインに失敗しました。メールアドレスとパスワードをご確認ください。');
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 }}>
            <form
                onSubmit={handleSubmit}
                style={{ width: '100%', maxWidth: 360, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,.3)' }}
            >
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>管理画面ログイン</h1>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>カタチ便 Admin OS</p>

                <label htmlFor="admin-email" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>メールアドレス</label>
                <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 16, fontSize: 15 }}
                />

                <label htmlFor="admin-password" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>パスワード</label>
                <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 20, fontSize: 15 }}
                />

                {error && (
                    <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: '100%', padding: '12px', background: submitting ? '#94a3b8' : '#00CFFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer' }}
                >
                    {submitting ? 'ログイン中…' : 'ログイン'}
                </button>
            </form>
        </div>
    );
}
