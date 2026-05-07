/**
 * @file src/sites/kataribin/pages/ContactPage.jsx
 *
 * /contact 独立ページ。
 * 気軽な相談窓口（シンプルな1画面フォーム + 任意の参考画像アップロード）。
 * 正式な多段階注文フォームは /intake に温存（誘導リンクあり）。
 *
 * Phase 7:
 *   - SNS URL を src/config/social.config.js に外出し
 *   - フォーム送信ボタン直下に /intake 誘導リンクを追加（既存 SNS 下も維持）
 *   - /contact?plan=<id> でプラン情報をテキストエリアに自動転記
 *
 * 送信は console.log のモック。Cloudflare Worker 連携は次フェーズ。
 */

import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { pricingPlans } from '../../../config/pricing.config';
import { SNS_LINKS } from '../../../config/social.config';
import '../styles/page-shared.css';
import './ContactPage.css';

const SHORT_FAQ = [
    {
        q: '相談だけでも大丈夫ですか？',
        a: 'もちろん大丈夫です。「こんなこと作れますか？」「予算感が知りたい」など、お気軽にご相談ください。',
    },
    {
        q: 'どのくらいで返信もらえますか？',
        a: '1営業日以内のご返信を目指しています。土日は返信が遅れる場合があります。',
    },
    {
        q: '制作費用はどのくらいですか？',
        a: 'プランページで基本料金をご確認いただけます。内容に応じた個別お見積もりにも対応しています。',
    },
];

/** SNS の表示順とラベル（URL は SNS_LINKS から引く） */
const SNS_DISPLAY = [
    { key: 'x', label: 'X (Twitter)' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'threads', label: 'Threads' },
];

/** プラン情報からフォーム本文のプリセット文字列を組み立てる */
const buildPrefilledMessage = (plan) => {
    const priceText =
        plan.priceLabel + (plan.priceUnit ? ` ／${plan.priceUnit}` : '');
    return [
        '以下のプランについて相談させてください。',
        `プラン: ${plan.name}`,
        `価格: ${priceText}`,
        '',
        '【ご質問・ご要望】',
        '',
        '',
    ].join('\n');
};

const ALLOWED_MIMES = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
]);
const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isAllowedFile = (f) =>
    ALLOWED_MIMES.has(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name);
const isHeic = (f) =>
    /heic|heif/i.test(f.type) || /\.(heic|heif)$/i.test(f.name);
const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const formatBytes = (b) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
};
const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

// ── Sub components ─────────────────────────────

function PageHero() {
    return (
        <header className="kt-page-hero">
            <div className="kt-page-hero__inner">
                <h1 className="kt-page-hero__title">お問い合わせ</h1>
                <p className="kt-page-hero__lead">
                    制作のご相談・ご質問はお気軽に。<br />
                    1営業日以内のご返信を目指しています。
                </p>
            </div>
        </header>
    );
}

function ShortFaqSection() {
    return (
        <section className="kt-section">
            <div className="kt-section__inner kt-section__inner--narrow">
                <h2 className="kt-section__title">よくあるご相談</h2>
                <dl className="kt-faq">
                    {SHORT_FAQ.map((it, i) => (
                        <div key={i} className="kt-faq__item">
                            <dt className="kt-faq__q">Q. {it.q}</dt>
                            <dd className="kt-faq__a">{it.a}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

function CompletedScreen() {
    return (
        <div className="kt-contact-completed">
            <div className="kt-contact-completed__inner">
                <div className="kt-contact-completed__mark" aria-hidden="true">✉️</div>
                <h1 className="kt-contact-completed__title">
                    お問い合わせ<br />ありがとうございました
                </h1>
                <p className="kt-contact-completed__text">
                    内容を拝見のうえ、1営業日以内にご返信いたします。<br />
                    少々お待ちくださいませ。
                </p>
                <div className="kt-contact-completed__nav">
                    <Link to="/" className="kt-btn kt-btn--primary">
                        TOPに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Field({ label, required, optional, error, children }) {
    return (
        <div className="kt-form-field">
            <label className="kt-form-label">
                {label}
                {required && <span className="kt-form-label__req">*</span>}
                {optional && <span className="kt-form-label__opt">（任意）</span>}
            </label>
            {children}
            {error && <p className="kt-form-error">{error}</p>}
        </div>
    );
}

// ── Main ───────────────────────────────────────

export default function ContactPage() {
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('plan');

    // 不正な plan id は null に解決される（警告は出さず単に空欄で開始）
    const prefilledPlan = useMemo(
        () => (planId ? pricingPlans.find((p) => p.id === planId) ?? null : null),
        [planId]
    );

    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState(() => ({
        name: '',
        email: '',
        message: prefilledPlan ? buildPrefilledMessage(prefilledPlan) : '',
    }));
    const [photos, setPhotos] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const update = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

    const validate = () => {
        const next = {};
        if (!data.name.trim()) next.name = 'お名前のご記入をお願いします。';
        if (!data.email.trim()) next.email = 'メールアドレスのご記入をお願いします。';
        else if (!isValidEmail(data.email)) next.email = 'メールアドレスの形式をご確認ください。';
        if (!data.message.trim()) next.message = 'ご相談内容のご記入をお願いします。';
        return next;
    };

    const handleAddFiles = async (fileList) => {
        const incoming = Array.from(fileList ?? []);
        const accepted = [];
        const errs = [];
        let slot = MAX_PHOTOS - photos.length;

        for (const f of incoming) {
            if (slot <= 0) {
                errs.push(`参考画像は最大${MAX_PHOTOS}枚までです。`);
                break;
            }
            if (!isAllowedFile(f)) {
                errs.push(`${f.name}: JPG / PNG / WEBP / HEIC のみご利用いただけます。`);
                continue;
            }
            if (f.size > MAX_FILE_SIZE) {
                errs.push(`${f.name}: ファイルサイズが5MBを超えています。`);
                continue;
            }
            try {
                const dataUrl = await readAsDataUrl(f);
                accepted.push({ name: f.name, size: f.size, type: f.type, dataUrl });
                slot -= 1;
            } catch {
                errs.push(`${f.name}: 読み込みに失敗しました。`);
            }
        }

        if (accepted.length) setPhotos((p) => [...p, ...accepted]);
        setErrors((prev) => {
            const { photos: _omit, ...rest } = prev;
            return errs.length ? { ...rest, photos: errs.join('\n') } : rest;
        });
    };

    const handleRemovePhoto = (idx) => {
        setPhotos((p) => p.filter((_, i) => i !== idx));
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleAddFiles(e.dataTransfer.files);
    };
    const handleZoneKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length) return;

        const submission = {
            ...data,
            referencePhotos: photos.map((p) => ({ name: p.name, size: p.size, type: p.type })),
            planContext: planId ?? null,
            submittedAt: new Date().toISOString(),
        };
        console.log('[contact] submission:', submission);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (submitted) return <CompletedScreen />;

    const isFull = photos.length >= MAX_PHOTOS;

    return (
        <div className="kt-page">
            <PageHero />
            <ShortFaqSection />

            <section className="kt-section kt-section--alt">
                <div className="kt-section__inner kt-section__inner--narrow">
                    <h2 className="kt-section__title">ご相談フォーム</h2>
                    {prefilledPlan && (
                        <p className="kt-contact-plan-hint">
                            選択中のプラン:{' '}
                            <strong>{prefilledPlan.name}</strong>
                            （{prefilledPlan.priceLabel}{prefilledPlan.priceUnit ? ` ／${prefilledPlan.priceUnit}` : ''}）
                        </p>
                    )}
                    <form className="kt-contact-form" onSubmit={handleSubmit} noValidate>
                        <Field label="お名前" required error={errors.name}>
                            <input
                                type="text"
                                className="kt-form-input"
                                value={data.name}
                                onChange={update('name')}
                                placeholder="山田 太郎"
                            />
                        </Field>

                        <Field label="メールアドレス" required error={errors.email}>
                            <input
                                type="email"
                                className="kt-form-input"
                                value={data.email}
                                onChange={update('email')}
                                placeholder="example@example.com"
                            />
                        </Field>

                        <Field label="ご相談内容" required error={errors.message}>
                            {prefilledPlan && (
                                <p className="kt-contact-prefill-note">
                                    ※ 内容を編集してから送信してください
                                </p>
                            )}
                            <textarea
                                className="kt-form-input kt-form-input--textarea"
                                rows={prefilledPlan ? 9 : 6}
                                value={data.message}
                                onChange={update('message')}
                                placeholder="制作のご要望・参考イメージ・予算感などお聞かせください"
                            />
                        </Field>

                        <Field label="参考画像" optional>
                            <div
                                className={`kt-dropzone${isDragging ? ' kt-dropzone--dragging' : ''}${isFull ? ' kt-dropzone--disabled' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={!isFull ? () => inputRef.current?.click() : undefined}
                                onKeyDown={!isFull ? handleZoneKey : undefined}
                                role="button"
                                tabIndex={isFull ? -1 : 0}
                                aria-disabled={isFull}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        handleAddFiles(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                                <p className="kt-dropzone__icon" aria-hidden="true">📎</p>
                                <p className="kt-dropzone__text">
                                    {isFull
                                        ? `参考画像は最大${MAX_PHOTOS}枚までです`
                                        : 'クリックまたはドラッグ&ドロップで追加'}
                                </p>
                                <p className="kt-dropzone__sub">
                                    JPG / PNG / WEBP / HEIC ・ 各5MBまで ・ 最大{MAX_PHOTOS}枚
                                </p>
                            </div>

                            {errors.photos && (
                                <p className="kt-form-error" style={{ whiteSpace: 'pre-line' }}>
                                    {errors.photos}
                                </p>
                            )}

                            {photos.length > 0 && (
                                <ul className="kt-photo-list">
                                    {photos.map((p, idx) => (
                                        <li key={`${p.name}-${idx}`} className="kt-photo-item">
                                            {isHeic(p) ? (
                                                <div className="kt-photo-item__heic">HEIC</div>
                                            ) : (
                                                <img
                                                    src={p.dataUrl}
                                                    alt={p.name}
                                                    className="kt-photo-item__img"
                                                />
                                            )}
                                            <div className="kt-photo-item__meta">
                                                <span className="kt-photo-item__name" title={p.name}>{p.name}</span>
                                                <span className="kt-photo-item__size">{formatBytes(p.size)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(idx)}
                                                className="kt-photo-item__remove"
                                                aria-label={`${p.name} を削除`}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Field>

                        <div className="kt-contact-form__actions">
                            <button
                                type="submit"
                                className="kt-btn kt-btn--primary kt-btn--lg"
                            >
                                送信する →
                            </button>
                        </div>
                        <p className="kt-contact-form__intake-hint">
                            より詳細な内容で正式注文される方は
                            <Link to="/intake">こちら →</Link>
                        </p>
                    </form>
                </div>
            </section>

            <section className="kt-section">
                <div className="kt-section__inner kt-section__inner--narrow">
                    <h2 className="kt-section__title">SNS でも受け付けています</h2>
                    <ul className="kt-sns-list">
                        {SNS_DISPLAY.map((s) => {
                            const url = SNS_LINKS[s.key];
                            if (!url) return null;
                            return (
                                <li key={s.key}>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="kt-sns-list__link"
                                    >
                                        {s.label} ↗
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="kt-contact-intake">
                        <p className="kt-contact-intake__lead">
                            ご注文内容が固まっている方は、正式注文フォームからお進みください。
                        </p>
                        <Link to="/intake" className="kt-btn kt-btn--outline">
                            正式注文はこちら →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
