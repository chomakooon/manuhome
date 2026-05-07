/**
 * @file src/sites/pawspress/pages/PawsPressContactPage.jsx
 *
 * /pet/contact の本実装。
 * 単一画面のシンプルなお問い合わせフォーム + 完了画面。
 * 送信は console.log のモック（API 連携は次ステップ）。
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/forms.css';
import './PawsPressContactPage.css';

const INQUIRY_TYPES = [
    'グッズ・プランについて',
    '制作期間について',
    '配送について',
    'その他',
];

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

function Field({ label, required, optional, error, children }) {
    return (
        <div className="paws-form-field">
            <label className="paws-form-label">
                {label}
                {required && <span className="paws-form-label__req">*</span>}
                {optional && <span className="paws-form-label__opt">（任意）</span>}
            </label>
            {children}
            {error && <p className="paws-form-error">{error}</p>}
        </div>
    );
}

function CompletedScreen() {
    return (
        <div className="paws-completed">
            <div className="paws-completed__inner">
                <div className="paws-completed__mark" aria-hidden="true">✉️</div>
                <h1 className="paws-completed__title">
                    お問い合わせ<br />ありがとうございました
                </h1>
                <p className="paws-completed__text">
                    内容を拝見のうえ、3営業日以内にご返信いたします。
                </p>
                <div className="paws-completed__nav">
                    <Link to="/pet" className="paws-form-btn paws-form-btn--primary">
                        TOPに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PawsPressContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState({
        name: '', email: '', phone: '', inquiryType: '', message: '',
    });
    const [errors, setErrors] = useState({});

    const update = (key) => (e) =>
        setData((d) => ({ ...d, [key]: e.target.value }));

    const validate = () => {
        const next = {};
        if (!data.name.trim()) next.name = 'お名前のご記入をお願いします。';
        if (!data.email.trim()) next.email = 'メールアドレスのご記入をお願いします。';
        else if (!isValidEmail(data.email)) next.email = 'メールアドレスの形式をご確認ください。';
        if (!data.message.trim()) next.message = 'お問い合わせ内容のご記入をお願いします。';
        return next;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length) return;

        const submission = { ...data, submittedAt: new Date().toISOString() };
        console.log('[contact] submission:', submission);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (submitted) return <CompletedScreen />;

    return (
        <div className="paws-contact">
            <header className="paws-contact__hero">
                <h1 className="paws-contact__title">お問い合わせ</h1>
                <p className="paws-contact__subtitle">
                    ご質問・ご相談はお気軽にお寄せください。
                </p>
            </header>

            <form className="paws-contact__form" onSubmit={handleSubmit} noValidate>
                <div className="paws-form-section">
                    <Field label="お名前" required error={errors.name}>
                        <input
                            type="text"
                            className="paws-form-input"
                            value={data.name}
                            onChange={update('name')}
                            placeholder="山田 太郎"
                        />
                    </Field>

                    <Field label="メールアドレス" required error={errors.email}>
                        <input
                            type="email"
                            className="paws-form-input"
                            value={data.email}
                            onChange={update('email')}
                            placeholder="example@example.com"
                        />
                    </Field>

                    <Field label="電話番号" optional>
                        <input
                            type="tel"
                            className="paws-form-input"
                            value={data.phone}
                            onChange={update('phone')}
                            placeholder="090-0000-0000"
                        />
                    </Field>

                    <Field label="お問い合わせ種別" optional>
                        <select
                            className="paws-form-input"
                            value={data.inquiryType}
                            onChange={update('inquiryType')}
                        >
                            <option value="">選択してください</option>
                            {INQUIRY_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="お問い合わせ内容" required error={errors.message}>
                        <textarea
                            className="paws-form-input paws-form-input--textarea"
                            rows={6}
                            value={data.message}
                            onChange={update('message')}
                            placeholder="ご相談内容をご記入ください"
                        />
                    </Field>
                </div>

                <div className="paws-contact__notice">
                    <p>3営業日以内にご返信いたします。</p>
                    <p className="paws-contact__notice-sub">
                        お急ぎの場合は備考欄にその旨ご記載ください。
                    </p>
                </div>

                <div className="paws-contact__nav">
                    <button
                        type="submit"
                        className="paws-form-btn paws-form-btn--primary"
                    >
                        送信する →
                    </button>
                </div>
            </form>
        </div>
    );
}
