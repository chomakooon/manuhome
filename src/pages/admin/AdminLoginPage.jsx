import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

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
    const [resetMsg, setResetMsg] = useState('');

    // 既にログイン済み(creator)なら /admin へ
    useEffect(() => {
        if (!loading && user && isCreator) {
            navigate('/admin', { replace: true });
        }
    }, [loading, user, isCreator, navigate]);

    const handleResetRequest = async () => {
        setError('');
        setResetMsg('');
        if (!email.trim()) {
            setError('パスワード再設定には、まずメールアドレスを入力してください。');
            return;
        }
        try {
            await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/admin/reset-password`,
            });
            setResetMsg('パスワード再設定メールを送信しました。メール内のリンクから新しいパスワードを設定してください。');
        } catch {
            setError('再設定メールの送信に失敗しました。時間をおいて再度お試しください。');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const result = await signInWithPassword(email.trim(), password);
            // ログイン直後、AuthContextのstate更新を待たず自分でprofileを確認して遷移する
            const uid = result?.user?.id;
            if (uid) {
                const { data: prof } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', uid)
                    .single();
                if (prof?.role === 'creator') {
                    navigate('/admin', { replace: true });
                    return;
                }
                setError('このアカウントには管理画面の権限がありません。');
                await supabase.auth.signOut();
                setSubmitting(false);
                return;
            }
            setError('ログインに失敗しました。');
            setSubmitting(false);
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
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>カタチらぼ Admin OS</p>

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
                {resetMsg && (
                    <p role="status" style={{ color: '#059669', fontSize: 13, marginBottom: 16 }}>{resetMsg}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: '100%', padding: '12px', background: submitting ? '#94a3b8' : '#00CFFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer' }}
                >
                    {submitting ? 'ログイン中…' : 'ログイン'}
                </button>

                <button
                    type="button"
                    onClick={handleResetRequest}
                    style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#64748b', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
                >
                    パスワードを忘れた方・変更したい方
                </button>
            </form>
        </div>
    );
}
