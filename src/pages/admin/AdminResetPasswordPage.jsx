import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * パスワード再設定ページ。
 * メールのリセットリンクから開かれる（URLハッシュにrecoveryトークンが入る）。
 * Supabaseが自動でセッションを確立するので、updateUserで新パスワードを設定する。
 */
export default function AdminResetPasswordPage() {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // recoveryリンクで開かれたか（セッションが確立されるのを待つ）
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                setReady(true);
            }
        });
        // 既にセッションがある場合
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setReady(true);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) {
            setError('パスワードは8文字以上で設定してください。');
            return;
        }
        if (password !== confirm) {
            setError('確認用パスワードが一致しません。');
            return;
        }
        setSubmitting(true);
        try {
            const { error: updErr } = await supabase.auth.updateUser({ password });
            if (updErr) throw updErr;
            setDone(true);
            setTimeout(() => navigate('/admin/login', { replace: true }), 2500);
        } catch {
            setError('パスワードの更新に失敗しました。リンクの有効期限切れの可能性があります。再度メールを送信してください。');
            setSubmitting(false);
        }
    };

    const card = { width: '100%', maxWidth: 360, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 10px 40px rgba(0,0,0,.3)' };
    const wrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 20 };
    const input = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 16, fontSize: 15 };
    const label = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 };

    if (done) {
        return (
            <div style={wrap}>
                <div style={card}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>パスワードを変更しました</h1>
                    <p style={{ fontSize: 14, color: '#475569' }}>まもなくログイン画面に移動します…</p>
                </div>
            </div>
        );
    }

    return (
        <div style={wrap}>
            <form onSubmit={handleSubmit} style={card}>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>新しいパスワード設定</h1>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>カタチらぼ Admin OS</p>

                {!ready && (
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                        リンクを確認しています…。このページはパスワード再設定メールのリンクから開いてください。
                    </p>
                )}

                <label htmlFor="new-password" style={label}>新しいパスワード（8文字以上）</label>
                <input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" style={input} />

                <label htmlFor="confirm-password" style={label}>新しいパスワード（確認）</label>
                <input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" style={input} />

                {error && <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}

                <button
                    type="submit"
                    disabled={submitting || !ready}
                    style={{ width: '100%', padding: '12px', background: (submitting || !ready) ? '#94a3b8' : '#00CFFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: (submitting || !ready) ? 'default' : 'pointer' }}
                >
                    {submitting ? '更新中…' : 'パスワードを変更する'}
                </button>
            </form>
        </div>
    );
}
