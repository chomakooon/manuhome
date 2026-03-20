import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import Icon from '../../components/common/Icon';
import './LoginPage.css';

export default function LoginPage() {
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'magic'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { signInWithPassword, signInWithEmail, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'magic') {
                await signInWithEmail(email);
                setMessage('ログインリンクをメールに送信しました。メールをご確認ください。');
            } else if (mode === 'register') {
                await signUp(email, password, fullName);
                setMessage('アカウントを作成しました。メールを確認してください。');
            } else {
                await signInWithPassword(email, password);
                navigate('/projects');
            }
        } catch (err) {
            setError(err.message || 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page__bg">
                <div className="login-page__orb login-page__orb--1" />
                <div className="login-page__orb login-page__orb--2" />
            </div>

            <div className="login-card">
                <div className="login-card__header">
                    <span className="login-card__logo">
                        <Icon name="Package" color="var(--color-accent)" size={32} />
                    </span>
                    <h1 className="login-card__title">カタチ便</h1>
                    <p className="login-card__subtitle">
                        {mode === 'register' ? '新規アカウント作成' : 'クライアントポータル'}
                    </p>
                </div>

                {/* Mode Tabs */}
                <div className="login-tabs">
                    <button
                        className={`login-tabs__btn ${mode === 'login' ? 'login-tabs__btn--active' : ''}`}
                        onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                    >
                        ログイン
                    </button>
                    <button
                        className={`login-tabs__btn ${mode === 'register' ? 'login-tabs__btn--active' : ''}`}
                        onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                    >
                        新規登録
                    </button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className="login-form__group">
                            <label className="login-form__label">
                                <User size={16} strokeWidth={1.5} />
                                お名前
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="山田太郎"
                                required
                            />
                        </div>
                    )}

                    <div className="login-form__group">
                        <label className="login-form__label">
                            <Mail size={16} strokeWidth={1.5} />
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    {mode !== 'magic' && (
                        <div className="login-form__group">
                            <label className="login-form__label">
                                <Lock size={16} strokeWidth={1.5} />
                                パスワード
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {error && <div className="login-message login-message--error">{error}</div>}
                    {message && <div className="login-message login-message--success">{message}</div>}

                    <button type="submit" className="btn btn-primary btn-lg login-form__submit" disabled={loading}>
                        {loading ? (
                            <><Loader size={18} className="spin" /> 処理中...</>
                        ) : (
                            <>
                                {mode === 'register' ? 'アカウント作成' : mode === 'magic' ? 'ログインリンクを送信' : 'ログイン'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {mode === 'login' && (
                    <button
                        className="login-magic-link"
                        onClick={() => { setMode('magic'); setError(''); setMessage(''); }}
                    >
                        パスワードなしでログイン（マジックリンク）
                    </button>
                )}
                {mode === 'magic' && (
                    <button
                        className="login-magic-link"
                        onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                    >
                        パスワードでログイン
                    </button>
                )}
            </div>
        </div>
    );
}
