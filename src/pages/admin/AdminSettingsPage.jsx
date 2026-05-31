import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './AdminOrderListPage.css';

/**
 * 管理画面の設定ページ。ログイン中ユーザーのパスワード変更。
 * ログイン済みセッションがあるため、現パスワード入力不要でupdateUser可能。
 */
export default function AdminSettingsPage() {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setDone(false);
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
            setPassword('');
            setConfirm('');
        } catch {
            setError('パスワードの更新に失敗しました。時間をおいて再度お試しください。');
        } finally {
            setSubmitting(false);
        }
    };

    const input = { width: '100%', maxWidth: 360, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 16, fontSize: 15 };
    const label = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 };

    return (
        <div className="admin-order-list">
            <div className="admin-header">
                <h1 className="admin-title">設定</h1>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 480, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>パスワード変更</h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                    ログイン中: {user?.email}
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="set-password" style={label}>新しいパスワード（8文字以上）</label>
                    <input id="set-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" style={input} />

                    <label htmlFor="set-confirm" style={label}>新しいパスワード（確認）</label>
                    <input id="set-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" style={input} />

                    {error && <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}
                    {done && <p role="status" style={{ color: '#059669', fontSize: 13, marginBottom: 16 }}>パスワードを変更しました。</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{ padding: '11px 24px', background: submitting ? '#94a3b8' : '#00CFFF', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: submitting ? 'default' : 'pointer' }}
                    >
                        {submitting ? '更新中…' : 'パスワードを変更する'}
                    </button>
                </form>
            </div>
        </div>
    );
}
