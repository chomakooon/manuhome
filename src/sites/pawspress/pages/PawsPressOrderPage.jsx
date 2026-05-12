/**
 * @file src/sites/pawspress/pages/PawsPressOrderPage.jsx
 *
 * /pet/order の本実装。4ステップのマルチステップフォーム + 完了画面。
 *  Step 1: プラン選択（必要に応じてグッズ選択）
 *  Step 2: 写真アップロード（FileReader によるプレビュー、最大3枚 / 各10MB）
 *  Step 3: お客様情報フォーム（バリデーション付き）
 *  Step 4: 確認 → 送信
 *  done : 完了画面
 *
 * 送信は console.log のモック（API 連携は次ステップ）。
 * URL クエリ ?plan=<id> があれば Step 1 で初期選択する。
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { pawspressPlans } from '../data/plans';
import PageSeo from '../../../components/PageSeo';
import '../styles/forms.css';
import './PawsPressOrderPage.css';

const STEP_LABELS = ['プラン選択', '写真アップロード', 'お客様情報', '確認・送信'];

const GOODS_OPTIONS = [
    'Tシャツ',
    'トートバッグ',
    'マグカップ',
    'アクリルキーホルダー',
    'その他ご相談',
];

const ALLOWED_MIMES = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif',
]);
const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const isAllowedFile = (file) =>
    ALLOWED_MIMES.has(file.type) || /\.(jpe?g|png|heic|heif)$/i.test(file.name);

const isHeic = (file) =>
    /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isValidPostalCode = (s) => /^\d{3}-?\d{4}$/.test(s.trim());

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

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// ── small UI ─────────────────────────────────────────

function StepIndicator({ current, labels }) {
    return (
        <ol className="paws-step-indicator" aria-label="入力ステップ">
            {labels.map((label, i) => {
                const n = i + 1;
                const status = current > n ? 'done' : current === n ? 'active' : 'pending';
                return (
                    <li key={n} className={`paws-step paws-step--${status}`}>
                        <span className="paws-step__circle" aria-hidden="true">
                            {status === 'done' ? '✓' : n}
                        </span>
                        <span className="paws-step__label">{label}</span>
                    </li>
                );
            })}
        </ol>
    );
}

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

// ── Step 1: Plan selection ─────────────────────────────

function Step1Plan({ planId, setPlanId, goodsTypes, setGoodsTypes, errors }) {
    return (
        <section className="paws-form-section">
            <h2 className="paws-form-section__title">プランをお選びください</h2>
            <div className="paws-plan-radio-group">
                {pawspressPlans.map((plan) => (
                    <label
                        key={plan.id}
                        className={`paws-plan-radio${planId === plan.id ? ' paws-plan-radio--checked' : ''}`}
                    >
                        <input
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={planId === plan.id}
                            onChange={() => {
                                setPlanId(plan.id);
                                setGoodsTypes(['', '']);
                            }}
                            className="paws-plan-radio__input"
                        />
                        <div className="paws-plan-radio__body">
                            <div className="paws-plan-radio__head">
                                <span className="paws-plan-radio__name">{plan.name}</span>
                                {plan.popular && plan.badge && (
                                    <span className="paws-plan-radio__badge">{plan.badge}</span>
                                )}
                            </div>
                            <span className="paws-plan-radio__tagline">{plan.tagline}</span>
                            <span className="paws-plan-radio__price">{plan.priceLabel}</span>
                            <ul className="paws-plan-radio__features">
                                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                            <span className="paws-plan-radio__delivery">納期目安：約{plan.deliveryDays}日</span>
                        </div>
                    </label>
                ))}
            </div>
            {errors.planId && <p className="paws-form-error">{errors.planId}</p>}

            {planId === 'pet-single' && (
                <div className="paws-form-section__sub">
                    <Field label="グッズの種類" required error={errors.goodsTypes}>
                        <select
                            className="paws-form-input"
                            value={goodsTypes[0]}
                            onChange={(e) => setGoodsTypes([e.target.value, ''])}
                        >
                            <option value="">選択してください</option>
                            {GOODS_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </Field>
                </div>
            )}

            {planId === 'pet-pair' && (
                <div className="paws-form-section__sub">
                    <Field label="グッズ2点の組み合わせ" required error={errors.goodsTypes}>
                        <p className="paws-form-help">同じ種類を2つお選びいただくこともできます。</p>
                        <div className="paws-form-pair">
                            {[0, 1].map((i) => (
                                <select
                                    key={i}
                                    className="paws-form-input"
                                    value={goodsTypes[i]}
                                    onChange={(e) => {
                                        const next = [...goodsTypes];
                                        next[i] = e.target.value;
                                        setGoodsTypes(next);
                                    }}
                                >
                                    <option value="">{i === 0 ? '1つ目を選択' : '2つ目を選択'}</option>
                                    {GOODS_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            ))}
                        </div>
                    </Field>
                </div>
            )}
        </section>
    );
}

// ── Step 2: Photo upload ───────────────────────────────

function Step2Photos({ photos, onAddFiles, onRemove, errors }) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        onAddFiles(e.dataTransfer.files);
    };
    const onClick = () => inputRef.current?.click();
    const onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const isFull = photos.length >= MAX_PHOTOS;

    return (
        <section className="paws-form-section">
            <h2 className="paws-form-section__title">お写真をお送りください</h2>
            <p className="paws-form-help">
                ご家族の表情がよくわかる、明るい写真を1〜3枚お送りください。<br />
                複数頭いらっしゃる場合は、全員が写った写真がおすすめです。
            </p>

            <div
                className={`paws-dropzone${isDragging ? ' paws-dropzone--dragging' : ''}${isFull ? ' paws-dropzone--disabled' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={!isFull ? onClick : undefined}
                onKeyDown={!isFull ? onKeyDown : undefined}
                role="button"
                tabIndex={isFull ? -1 : 0}
                aria-label="写真をアップロード"
                aria-disabled={isFull}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        onAddFiles(e.target.files);
                        e.target.value = '';
                    }}
                />
                <p className="paws-dropzone__icon" aria-hidden="true">📷</p>
                <p className="paws-dropzone__text">
                    {isFull
                        ? `お写真は最大${MAX_PHOTOS}枚までお送りいただけます`
                        : 'クリックまたはドラッグ&ドロップで写真を追加'}
                </p>
                <p className="paws-dropzone__sub">JPG / PNG / HEIC ・ 各10MBまで ・ 最大{MAX_PHOTOS}枚</p>
            </div>

            <p className="paws-form-help paws-form-help--note">
                ※ HEICファイルはプレビュー表示されない場合がありますが、送信は可能です。
            </p>

            {errors.photos && (
                <p className="paws-form-error" style={{ whiteSpace: 'pre-line' }}>
                    {errors.photos}
                </p>
            )}

            {photos.length > 0 && (
                <ul className="paws-photo-list">
                    {photos.map((photo, idx) => (
                        <li key={`${photo.name}-${idx}`} className="paws-photo-item">
                            {isHeic(photo) ? (
                                <div className="paws-photo-item__heic">
                                    <span className="paws-photo-item__heic-tag">HEIC</span>
                                </div>
                            ) : (
                                <img
                                    src={photo.dataUrl}
                                    alt={photo.name}
                                    className="paws-photo-item__img"
                                />
                            )}
                            <div className="paws-photo-item__meta">
                                <span className="paws-photo-item__name" title={photo.name}>{photo.name}</span>
                                <span className="paws-photo-item__size">{formatBytes(photo.size)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="paws-photo-item__remove"
                                aria-label={`${photo.name} を削除`}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// ── Step 3: Customer info ──────────────────────────────

function Step3Customer({ customer, updateCustomer, errors }) {
    return (
        <section className="paws-form-section">
            <h2 className="paws-form-section__title">お客様情報をお聞かせください</h2>

            <Field label="お名前" required error={errors.name}>
                <input
                    type="text"
                    className="paws-form-input"
                    value={customer.name}
                    onChange={updateCustomer('name')}
                    placeholder="山田 太郎"
                />
            </Field>

            <Field label="メールアドレス" required error={errors.email}>
                <input
                    type="email"
                    className="paws-form-input"
                    value={customer.email}
                    onChange={updateCustomer('email')}
                    placeholder="example@example.com"
                />
            </Field>

            <Field label="電話番号" optional>
                <input
                    type="tel"
                    className="paws-form-input"
                    value={customer.phone}
                    onChange={updateCustomer('phone')}
                    placeholder="090-0000-0000"
                />
            </Field>

            <Field label="ペットのお名前" required error={errors.petName}>
                <input
                    type="text"
                    className="paws-form-input"
                    value={customer.petName}
                    onChange={updateCustomer('petName')}
                    placeholder="モカ"
                />
            </Field>

            <Field label="ペットの種類・特徴" required error={errors.petDetail}>
                <textarea
                    className="paws-form-input paws-form-input--textarea"
                    rows={4}
                    value={customer.petDetail}
                    onChange={updateCustomer('petDetail')}
                    placeholder="例: ミニチュアダックスフンド・茶色・3歳・元気な男の子"
                />
            </Field>

            <Field label="配送先郵便番号" required error={errors.postalCode}>
                <input
                    type="text"
                    className="paws-form-input paws-form-input--short"
                    value={customer.postalCode}
                    onChange={updateCustomer('postalCode')}
                    placeholder="123-4567"
                    inputMode="numeric"
                />
            </Field>

            <Field label="配送先住所" required error={errors.address}>
                <input
                    type="text"
                    className="paws-form-input"
                    value={customer.address}
                    onChange={updateCustomer('address')}
                    placeholder="東京都新宿区..."
                />
            </Field>

            <Field label="備考・ご要望" optional>
                <textarea
                    className="paws-form-input paws-form-input--textarea"
                    rows={3}
                    value={customer.note}
                    onChange={updateCustomer('note')}
                    placeholder="特別なご要望などあればお聞かせください"
                />
            </Field>
        </section>
    );
}

// ── Step 4: Review ─────────────────────────────────────

function ReviewRow({ label, children }) {
    return (
        <div className="paws-review__row">
            <div className="paws-review__label">{label}</div>
            <div className="paws-review__value">{children}</div>
        </div>
    );
}

function Step4Review({ plan, goodsTypes, photos, customer }) {
    return (
        <section className="paws-form-section">
            <h2 className="paws-form-section__title">ご入力内容をご確認ください</h2>

            <div className="paws-review">
                <ReviewRow label="ご選択プラン">
                    <strong>{plan.name}</strong>（{plan.priceLabel}）
                    <div className="paws-review__sub">{plan.tagline}</div>
                </ReviewRow>

                {plan.id === 'pet-single' && goodsTypes[0] && (
                    <ReviewRow label="グッズ">{goodsTypes[0]}</ReviewRow>
                )}
                {plan.id === 'pet-pair' && (
                    <ReviewRow label="グッズ（2点）">
                        {goodsTypes[0]} ／ {goodsTypes[1]}
                    </ReviewRow>
                )}

                <ReviewRow label="お写真">
                    <div className="paws-review__photos">
                        {photos.map((p, i) => (
                            isHeic(p)
                                ? (
                                    <div key={i} className="paws-review__photo paws-review__photo--heic">
                                        <span>HEIC</span>
                                        <span className="paws-review__photo-name">{p.name}</span>
                                    </div>
                                )
                                : (
                                    <img
                                        key={i}
                                        src={p.dataUrl}
                                        alt={p.name}
                                        className="paws-review__photo"
                                    />
                                )
                        ))}
                    </div>
                </ReviewRow>

                <ReviewRow label="お名前">{customer.name}</ReviewRow>
                <ReviewRow label="メールアドレス">{customer.email}</ReviewRow>
                {customer.phone && <ReviewRow label="電話番号">{customer.phone}</ReviewRow>}
                <ReviewRow label="ペットのお名前">{customer.petName}</ReviewRow>
                <ReviewRow label="ペットの種類・特徴">
                    <span style={{ whiteSpace: 'pre-line' }}>{customer.petDetail}</span>
                </ReviewRow>
                <ReviewRow label="郵便番号">{customer.postalCode}</ReviewRow>
                <ReviewRow label="ご住所">{customer.address}</ReviewRow>
                {customer.note && (
                    <ReviewRow label="備考">
                        <span style={{ whiteSpace: 'pre-line' }}>{customer.note}</span>
                    </ReviewRow>
                )}
            </div>
        </section>
    );
}

// ── Completion screen ─────────────────────────────────

function CompletedScreen() {
    return (
        <div className="paws-completed">
            <div className="paws-completed__inner">
                <div className="paws-completed__mark" aria-hidden="true">🎀</div>
                <h1 className="paws-completed__title">
                    お申し込み<br />ありがとうございました
                </h1>
                <p className="paws-completed__text">
                    内容を拝見のうえ、3営業日以内にご連絡いたします。<br />
                    少々お待ちくださいませ。
                </p>
                <div className="paws-completed__nav">
                    <Link to="/pet" className="paws-form-btn paws-form-btn--primary">
                        TOPに戻る
                    </Link>
                    <Link to="/pet#plans" className="paws-form-btn paws-form-btn--secondary">
                        他のプランも見る
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────

export default function PawsPressOrderPage() {
    const [searchParams] = useSearchParams();
    const initialPlan = searchParams.get('plan') ?? '';

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const [planId, setPlanId] = useState(
        pawspressPlans.find((p) => p.id === initialPlan) ? initialPlan : ''
    );
    const [goodsTypes, setGoodsTypes] = useState(['', '']);
    const [photos, setPhotos] = useState([]);
    const [customer, setCustomer] = useState({
        name: '', email: '', petName: '', petDetail: '',
        postalCode: '', address: '', phone: '', note: '',
    });

    const selectedPlan = useMemo(
        () => pawspressPlans.find((p) => p.id === planId) ?? null,
        [planId]
    );

    const updateCustomer = (key) => (e) =>
        setCustomer((c) => ({ ...c, [key]: e.target.value }));

    const validate = useCallback((s) => {
        const next = {};
        if (s === 1) {
            if (!planId) {
                next.planId = 'ご希望のプランをお選びください。';
            } else if (planId === 'pet-single' && !goodsTypes[0]) {
                next.goodsTypes = 'グッズの種類をお選びください。';
            } else if (planId === 'pet-pair' && (!goodsTypes[0] || !goodsTypes[1])) {
                next.goodsTypes = 'グッズを2点お選びください。';
            }
        } else if (s === 2) {
            if (photos.length === 0) {
                next.photos = 'お写真を1枚以上お送りください。';
            }
        } else if (s === 3) {
            const c = customer;
            if (!c.name.trim()) next.name = 'お名前のご記入をお願いします。';
            if (!c.email.trim()) next.email = 'メールアドレスのご記入をお願いします。';
            else if (!isValidEmail(c.email)) next.email = 'メールアドレスの形式をご確認ください。';
            if (!c.petName.trim()) next.petName = 'ペットのお名前のご記入をお願いします。';
            if (!c.petDetail.trim()) next.petDetail = 'ペットの種類・特徴のご記入をお願いします。';
            if (!c.postalCode.trim()) next.postalCode = '郵便番号のご記入をお願いします。';
            else if (!isValidPostalCode(c.postalCode)) {
                next.postalCode = '郵便番号は7桁の数字でご記入ください（例: 1234567 / 123-4567）。';
            }
            if (!c.address.trim()) next.address = 'ご住所のご記入をお願いします。';
        }
        return next;
    }, [planId, goodsTypes, photos, customer]);

    const handleNext = () => {
        const e = validate(step);
        setErrors(e);
        if (Object.keys(e).length === 0) {
            setStep((s) => s + 1);
            scrollTop();
        }
    };

    const handleBack = () => {
        setErrors({});
        setStep((s) => Math.max(1, s - 1));
        scrollTop();
    };

    const handleEdit = () => {
        setStep(1);
        setErrors({});
        scrollTop();
    };

    const handleSubmit = () => {
        const submission = {
            plan: selectedPlan,
            goodsTypes:
                planId === 'pet-frame' ? []
                    : planId === 'pet-single' ? [goodsTypes[0]]
                        : goodsTypes,
            photos: photos.map((p) => ({ name: p.name, size: p.size, type: p.type })),
            customer,
            submittedAt: new Date().toISOString(),
        };
        console.log('[order] submission:', submission);
        setSubmitted(true);
        scrollTop();
    };

    const handleAddFiles = async (fileList) => {
        const incoming = Array.from(fileList ?? []);
        const accepted = [];
        const errs = [];
        let slot = MAX_PHOTOS - photos.length;

        for (const f of incoming) {
            if (slot <= 0) {
                errs.push(`お写真は最大${MAX_PHOTOS}枚までお送りいただけます。`);
                break;
            }
            if (!isAllowedFile(f)) {
                errs.push(`${f.name}: JPG / PNG / HEIC のみご利用いただけます。`);
                continue;
            }
            if (f.size > MAX_FILE_SIZE) {
                errs.push(`${f.name}: ファイルサイズが10MBを超えています。`);
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

        if (accepted.length) {
            setPhotos((p) => [...p, ...accepted]);
        }
        setErrors((prev) => {
            const { photos: _omit, ...rest } = prev;
            return errs.length ? { ...rest, photos: errs.join('\n') } : rest;
        });
    };

    const handleRemovePhoto = (idx) => {
        setPhotos((p) => p.filter((_, i) => i !== idx));
    };

    if (submitted) return <CompletedScreen />;

    return (
        <div className="paws-order">
            <PageSeo pageKey="petOrder" />
            <header className="paws-order__hero">
                <h1 className="paws-order__title">ご注文・ご相談</h1>
                <p className="paws-order__subtitle">
                    写真を送るだけ、世界に一つのイラストグッズをお作りします。
                </p>
                <StepIndicator current={step} labels={STEP_LABELS} />
            </header>

            <div className="paws-order__body">
                {step === 1 && (
                    <Step1Plan
                        planId={planId}
                        setPlanId={(id) => { setPlanId(id); setErrors({}); }}
                        goodsTypes={goodsTypes}
                        setGoodsTypes={setGoodsTypes}
                        errors={errors}
                    />
                )}
                {step === 2 && (
                    <Step2Photos
                        photos={photos}
                        onAddFiles={handleAddFiles}
                        onRemove={handleRemovePhoto}
                        errors={errors}
                    />
                )}
                {step === 3 && (
                    <Step3Customer
                        customer={customer}
                        updateCustomer={updateCustomer}
                        errors={errors}
                    />
                )}
                {step === 4 && (
                    <Step4Review
                        plan={selectedPlan}
                        goodsTypes={goodsTypes}
                        photos={photos}
                        customer={customer}
                    />
                )}
            </div>

            <div className="paws-order__nav">
                {step > 1 && step < 4 && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="paws-form-btn paws-form-btn--secondary"
                    >
                        ← 戻る
                    </button>
                )}
                {step < 4 && (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="paws-form-btn paws-form-btn--primary"
                    >
                        次へ →
                    </button>
                )}
                {step === 4 && (
                    <>
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="paws-form-btn paws-form-btn--secondary"
                        >
                            修正する
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="paws-form-btn paws-form-btn--primary"
                        >
                            送信する
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
