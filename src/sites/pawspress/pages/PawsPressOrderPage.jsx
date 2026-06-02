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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { isStripeConfigured } from '../../../lib/stripe';
import { pawspressPlans, GIFT_WRAP_OPTION } from '../data/plans';
import { findCoupon, isCouponApplicable, computeDiscount } from '../data/coupons';
import PageSeo from '../../../components/PageSeo';
import PictureWebp from '../../../components/PictureWebp';
import '../styles/forms.css';
import './PawsPressOrderPage.css';

const STEP_LABELS = ['プラン選択', '写真アップロード', 'お客様情報', '確認', 'お支払い'];

/**
 * グッズ種類カタログ。
 * name は select の旧 value と互換性を保つため文字列ベースで維持。
 * image は注文ページ Step1 のビジュアルピッカーで使用。
 */
const GOODS_OPTIONS = [
    { name: 'Tシャツ',           image: '/works/goods-tshirt.webp' },
    { name: 'お散歩バッグ',       image: '/works/goods-tote.webp' },
    { name: 'キャンバスバッグ',    image: '/works/goods-canvas.webp' },
    { name: 'マグカップ',         image: '/works/goods-mug.webp' },
    { name: 'クッション',         image: '/works/goods-cushion.webp' },
    { name: 'スマホケース',       image: '/works/goods-phonecase.webp' },
    { name: 'アクリルキーホルダー', image: '/works/goods-acrylic.webp' },
    { name: 'その他ご相談',        image: null,  iconChar: '💬' },
];

const goodsByName = (n) => GOODS_OPTIONS.find((g) => g.name === n);

const TSHIRT_SIZES = ['S', 'M', 'L', 'LL'];
const CUSHION_SIZES = ['45cm × 45cm', '50cm × 50cm'];
const PHONECASE_MODELS = [
    'iPhone 16 / 16 Pro',
    'iPhone 15 / 15 Pro',
    'iPhone 14 / 14 Pro',
    'iPhone 13 / 13 Pro',
    'その他（Android含む）',
];

// グッズの詳細（サイズ・種別）の選択肢と ⓘ 詳細情報。
// options が無い / 1件のみの場合、GoodsDetailSelect は info 表示だけを描画する。
const GOODS_DETAIL = {
    'Tシャツ': {
        field: 'サイズ',
        options: TSHIRT_SIZES,
        defaultValue: 'M',
        info: {
            title: 'Tシャツ サイズ目安（着丈 / 身幅）',
            rows: [
                ['S', '着丈 65cm / 身幅 49cm'],
                ['M', '着丈 69cm / 身幅 52cm'],
                ['L', '着丈 73cm / 身幅 55cm'],
                ['LL', '着丈 77cm / 身幅 58cm'],
            ],
            note: '※ 平置き実寸の目安です。多少の個体差があります。',
        },
    },
    'お散歩バッグ': {
        field: 'サイズ',
        info: {
            title: 'お散歩バッグ サイズ',
            rows: [
                ['本体', '約 W25 × H20cm'],
                ['特徴', '外ポケット付き／お散歩グッズの携帯に'],
            ],
            note: '※ サイズは目安です。',
        },
    },
    'キャンバスバッグ': {
        field: 'サイズ',
        info: {
            title: 'キャンバスバッグ サイズ',
            rows: [
                ['本体', '約 W36 × H40cm'],
                ['特徴', 'A4が入る普段使いサイズ／厚手キャンバス生地'],
            ],
            note: '※ サイズは目安です。',
        },
    },
    'マグカップ': {
        field: 'サイズ',
        info: {
            title: 'マグカップ サイズ',
            rows: [
                ['容量', '約 350ml'],
                ['寸法', '約 φ8.0 × H9.5cm'],
                ['素材', '陶器（電子レンジ・食洗機対応）'],
            ],
        },
    },
    'クッション': {
        field: 'サイズ',
        options: CUSHION_SIZES,
        defaultValue: '45cm × 45cm',
        info: {
            title: 'クッション サイズ',
            rows: [
                ['45cm × 45cm', '一般的なソファ用サイズ'],
                ['50cm × 50cm', 'ゆったり大きめサイズ'],
            ],
            note: '※ カバー＋中綿セットでのお届けです。',
        },
    },
    'スマホケース': {
        field: '対応機種',
        options: PHONECASE_MODELS,
        defaultValue: 'iPhone 16 / 16 Pro',
        info: {
            title: 'スマホケース 対応機種',
            rows: [
                ['素材', 'バイオプラスチック（環境配慮素材）'],
                ['対応', 'iPhone 13〜16 シリーズ'],
                ['その他', 'Android機種は別途お問い合わせください'],
            ],
        },
    },
    'アクリルキーホルダー': {
        field: 'サイズ',
        info: {
            title: 'アクリルキーホルダー サイズ',
            rows: [
                ['本体', '約 5cm × 5cm'],
                ['素材', '透明アクリル（厚さ約3mm）／金具付き'],
            ],
        },
    },
};

// グッズ選択時に詳細（サイズ/種別）の初期値を返す（未対応グッズは空）
const defaultGoodsDetail = (goods) => GOODS_DETAIL[goods]?.defaultValue ?? '';

// 画風選択（キャラクター調メイン / 実写風 / その他のご相談）
const ART_STYLES = [
    {
        id: 'character',
        name: 'キャラクター調',
        desc: '水彩タッチで、表情や個性をキャラクターとして描き起こします。',
        image: '/works/style-character.webp',
        recommended: true,
    },
    {
        id: 'realistic',
        name: '実写風',
        desc: '写真の質感を活かした繊細なタッチ。よりリアルな仕上がりに。',
        image: '/works/pet-illust-1.jpg',
    },
    {
        id: 'other',
        name: 'その他のご相談',
        desc: '墨絵風・ドット絵風・油絵風など、ご希望のテイストを自由にご相談ください。',
        image: '/works/style-other.webp',
    },
];

const artStyleLabel = (id) =>
    ART_STYLES.find((s) => s.id === id)?.name ?? id;

const MAX_STYLE_REFS = 3;

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

const formatYen = (n) => `¥${n.toLocaleString('ja-JP')}`;

// モック決済のカード入力バリデーション（実決済は決済プロバイダに委譲）
const isCardComplete = (card) =>
    /^\d{14,16}$/.test(card.number.replace(/\s/g, '')) &&
    /^\d{2}\s*\/\s*\d{2}$/.test(card.expiry.trim()) &&
    /^\d{3,4}$/.test(card.cvc.trim()) &&
    card.holder.trim().length > 0;

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

// ⓘ アイコン + タップで開く詳細ポップオーバー（サイズ感など）
function InfoPopover({ info }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <span className="paws-info" ref={ref}>
            <button
                type="button"
                className="paws-info__btn"
                aria-label={`${info.title} の詳細を表示`}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                i
            </button>
            {open && (
                <span className="paws-info__pop" role="dialog" aria-label={info.title}>
                    <span className="paws-info__title">{info.title}</span>
                    <span className="paws-info__rows">
                        {info.rows.map((r) => (
                            <span key={r[0]} className="paws-info__row">
                                <span className="paws-info__key">{r[0]}</span>
                                <span className="paws-info__val">{r[1]}</span>
                            </span>
                        ))}
                    </span>
                    {info.note && <span className="paws-info__note">{info.note}</span>}
                </span>
            )}
        </span>
    );
}

// ── Step 1: Plan selection ─────────────────────────────

/**
 * グッズ種類のビジュアルピッカー。
 * 旧 <select> を置き換え、商品モックアップ画像で選びやすくする。
 * value/onChange のインターフェースは <select> と同じ（文字列の name）。
 */
function GoodsPicker({ value, onChange, name, placeholder }) {
    return (
        <div className="paws-goods-picker" role="radiogroup" aria-label={placeholder ?? 'グッズを選択'}>
            {GOODS_OPTIONS.map((g) => {
                const checked = value === g.name;
                const inputId = `${name}-${g.name}`;
                return (
                    <label
                        key={g.name}
                        htmlFor={inputId}
                        className={`paws-goods-picker__card${checked ? ' paws-goods-picker__card--checked' : ''}`}
                    >
                        <input
                            id={inputId}
                            type="radio"
                            name={name}
                            value={g.name}
                            checked={checked}
                            onChange={() => onChange(g.name)}
                            className="paws-goods-picker__input"
                        />
                        <span className="paws-goods-picker__image">
                            {g.image ? (
                                <PictureWebp
                                    src={g.image}
                                    alt={`${g.name}のイメージ`}
                                    loading="lazy"
                                />
                            ) : (
                                <span className="paws-goods-picker__icon" aria-hidden="true">
                                    {g.iconChar ?? '🎁'}
                                </span>
                            )}
                        </span>
                        <span className="paws-goods-picker__name">{g.name}</span>
                    </label>
                );
            })}
        </div>
    );
}

function GoodsDetailSelect({ goods, value, onChange }) {
    const detail = GOODS_DETAIL[goods];
    if (!detail) return null;
    const hasChoices = Array.isArray(detail.options) && detail.options.length > 0;
    return (
        <div className="paws-goods-detail">
            <span className="paws-goods-detail__label">
                {goods}の{detail.field}
                <InfoPopover info={detail.info} />
            </span>
            {hasChoices ? (
                <select
                    className="paws-form-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label={`${goods}の${detail.field}`}
                >
                    {detail.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            ) : (
                /* 単一仕様の商品: 選択肢はなく info のサマリを直接表示する */
                <ul className="paws-goods-detail__specs">
                    {detail.info.rows.map((r, i) => (
                        <li key={i}>
                            <span className="paws-goods-detail__specs-key">{r[0]}</span>
                            <span className="paws-goods-detail__specs-val">{r[1]}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const GIFT_MESSAGE_MAX = 100;

function Step1Plan({
    planId, setPlanId, goodsTypes, setGoodsTypes,
    goodsDetails, setGoodsDetails,
    artStyle, setArtStyle,
    customStyle, setCustomStyle,
    styleReferences, setStyleReferences,
    giftWrap, setGiftWrap, giftMessage, setGiftMessage,
    errors,
}) {
    const hasGoods = planId === 'pet-single' || planId === 'pet-pair';
    const refInputRef = useRef(null);

    // 「その他」用 参考画像の追加（最大3枚 / 10MB）
    const handleAddStyleRefs = async (fileList) => {
        const incoming = Array.from(fileList ?? []);
        let slot = MAX_STYLE_REFS - styleReferences.length;
        const accepted = [];
        for (const f of incoming) {
            if (slot <= 0) break;
            if (!isAllowedFile(f)) continue;
            if (f.size > MAX_FILE_SIZE) continue;
            try {
                const dataUrl = await readAsDataUrl(f);
                accepted.push({ name: f.name, size: f.size, type: f.type, dataUrl });
                slot -= 1;
            } catch { /* ignore single-file failure */ }
        }
        if (accepted.length) setStyleReferences([...styleReferences, ...accepted]);
    };
    const removeStyleRef = (idx) =>
        setStyleReferences(styleReferences.filter((_, i) => i !== idx));

    const setSlotGoods = (slot, value) => {
        const nextTypes = [...goodsTypes];
        nextTypes[slot] = value;
        setGoodsTypes(nextTypes);
        const nextDetails = [...goodsDetails];
        nextDetails[slot] = defaultGoodsDetail(value);
        setGoodsDetails(nextDetails);
    };

    const setSlotDetail = (slot, value) => {
        const next = [...goodsDetails];
        next[slot] = value;
        setGoodsDetails(next);
    };
    return (
        <section className="paws-form-section">
            <h2 className="paws-form-section__title">プランをお選びください</h2>
            <div className="paws-plan-radio-group">
                {pawspressPlans.map((plan) => (
                    <label
                        key={plan.id}
                        htmlFor={`plan-${plan.id}`}
                        className={`paws-plan-radio${planId === plan.id ? ' paws-plan-radio--checked' : ''}`}
                    >
                        <span className="sr-only">{plan.name}</span>
                        <input
                            id={`plan-${plan.id}`}
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={planId === plan.id}
                            onChange={() => {
                                setPlanId(plan.id);
                                setGoodsTypes(['', '']);
                                setGoodsDetails(['', '']);
                                setGiftWrap(false);
                                setGiftMessage('');
                            }}
                            className="paws-plan-radio__input"
                        />
                        <div className="paws-plan-radio__body">
                            {plan.image && (
                                <div className="paws-plan-radio__image">
                                    <PictureWebp
                                        src={plan.image}
                                        alt={plan.imageAlt ?? plan.name}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="paws-plan-radio__head">
                                <span className="paws-plan-radio__name">{plan.name}</span>
                                {plan.popular && plan.badge && (
                                    <span className="paws-plan-radio__badge">{plan.badge}</span>
                                )}
                            </div>
                            <span className="paws-plan-radio__tagline">{plan.tagline}</span>
                            {plan.originalPriceLabel ? (
                                <span className="paws-plan-radio__price paws-plan-radio__price--sale">
                                    <span className="paws-plan-radio__price-original">
                                        {plan.originalPriceLabel}
                                    </span>
                                    <span className="paws-plan-radio__price-now">
                                        {plan.saleLabel && (
                                            <span className="paws-plan-radio__sale-label">
                                                {plan.saleLabel}
                                            </span>
                                        )}
                                        {plan.priceLabel}
                                    </span>
                                </span>
                            ) : (
                                <span className="paws-plan-radio__price">{plan.priceLabel}</span>
                            )}
                            <ul className="paws-plan-radio__features">
                                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                            <span className="paws-plan-radio__delivery">納期目安：約{plan.deliveryDays}日</span>
                        </div>
                    </label>
                ))}
            </div>
            {errors.planId && <p className="paws-form-error">{errors.planId}</p>}

            {planId === 'pet-trial' && (
                <div className="paws-form-section__sub">
                    <div className="paws-form-callout paws-form-callout--info">
                        <span className="paws-form-callout__icon" aria-hidden="true">💾</span>
                        <div className="paws-form-callout__body">
                            <p className="paws-form-callout__title">デジタルデータのみのプランです</p>
                            <p className="paws-form-callout__desc">
                                Trial Digital にはグッズは含まれません。Tシャツ・トートバッグ等のグッズが必要な場合は <strong>Single Item</strong> または <strong>Pair Set</strong> をお選びください。
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {planId === 'pet-single' && (
                <div className="paws-form-section__sub">
                    <Field label="グッズの種類" required error={errors.goodsTypes}>
                        <GoodsPicker
                            name="goods-single"
                            value={goodsTypes[0]}
                            onChange={(v) => setSlotGoods(0, v)}
                            placeholder="グッズを選択"
                        />
                    </Field>
                    <GoodsDetailSelect
                        goods={goodsTypes[0]}
                        value={goodsDetails[0]}
                        onChange={(v) => setSlotDetail(0, v)}
                    />
                </div>
            )}

            {planId === 'pet-pair' && (
                <div className="paws-form-section__sub">
                    <Field label="グッズ2点の組み合わせ" required error={errors.goodsTypes}>
                        <p className="paws-form-help">同じ種類を2つお選びいただくこともできます。</p>
                        <div className="paws-form-pair">
                            {[0, 1].map((i) => (
                                <div key={i} className="paws-form-pair__slot">
                                    <p className="paws-form-pair__slot-label">
                                        {i === 0 ? '1つ目のグッズ' : '2つ目のグッズ'}
                                    </p>
                                    <GoodsPicker
                                        name={`goods-pair-${i}`}
                                        value={goodsTypes[i]}
                                        onChange={(v) => setSlotGoods(i, v)}
                                        placeholder={i === 0 ? '1つ目を選択' : '2つ目を選択'}
                                    />
                                    <GoodsDetailSelect
                                        goods={goodsTypes[i]}
                                        value={goodsDetails[i]}
                                        onChange={(v) => setSlotDetail(i, v)}
                                    />
                                </div>
                            ))}
                        </div>
                    </Field>
                </div>
            )}

            {planId && (
                <div className="paws-form-section__sub">
                    <p className="paws-form-label">
                        画風をお選びください
                        <span className="paws-form-label__opt">（おすすめ: キャラクター調）</span>
                    </p>
                    <p className="paws-form-help">
                        もふらぼ は <strong>キャラクター調</strong> がメインです。実写風や、墨絵風/ドット絵風など <strong>その他のテイスト</strong> もご相談いただけます。
                    </p>
                    <div className="paws-art-style">
                        {ART_STYLES.map((style) => {
                            const checked = artStyle === style.id;
                            return (
                                <label
                                    key={style.id}
                                    htmlFor={`art-${style.id}`}
                                    className={`paws-art-style__card${checked ? ' paws-art-style__card--checked' : ''}`}
                                >
                                    <span className="sr-only">{style.name}</span>
                                    <input
                                        id={`art-${style.id}`}
                                        type="radio"
                                        name="artStyle"
                                        value={style.id}
                                        checked={checked}
                                        onChange={() => setArtStyle(style.id)}
                                        className="paws-art-style__input"
                                    />
                                    {style.recommended && (
                                        <span className="paws-art-style__badge">メイン</span>
                                    )}
                                    <span className="paws-art-style__image">
                                        {style.image ? (
                                            <PictureWebp
                                                src={style.image}
                                                alt={`${style.name}のサンプルイラスト`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span
                                                className="paws-art-style__icon"
                                                aria-hidden="true"
                                            >
                                                {style.iconChar ?? '✨'}
                                            </span>
                                        )}
                                    </span>
                                    <span className="paws-art-style__body">
                                        <span className="paws-art-style__name">{style.name}</span>
                                        <span className="paws-art-style__desc">{style.desc}</span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {artStyle === 'other' && (
                        <div className="paws-art-other">
                            <label
                                htmlFor="art-other-detail"
                                className="paws-form-label"
                            >
                                ご希望のテイスト・参考にしたい雰囲気
                                <span className="paws-form-label__opt">（自由記入）</span>
                            </label>
                            <p className="paws-form-help">
                                例: 墨絵風で和の雰囲気に / ドット絵風 / 油絵風 / ○○さんの作品のタッチに寄せて など
                            </p>
                            <textarea
                                id="art-other-detail"
                                className="paws-form-input paws-form-input--textarea"
                                rows={3}
                                value={customStyle}
                                onChange={(e) => setCustomStyle(e.target.value)}
                                placeholder="ご希望のテイストや雰囲気をご自由にご記入ください"
                            />

                            <div className="paws-art-other__refs">
                                <p className="paws-form-label">
                                    参考画像
                                    <span className="paws-form-label__opt">
                                        （任意・最大{MAX_STYLE_REFS}枚 / 各10MBまで）
                                    </span>
                                </p>
                                <p className="paws-form-help">
                                    雰囲気が伝わる画像があれば一緒にお送りください。
                                </p>
                                <input
                                    ref={refInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        handleAddStyleRefs(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                                <button
                                    type="button"
                                    className="paws-art-other__upload-btn"
                                    onClick={() => refInputRef.current?.click()}
                                    disabled={styleReferences.length >= MAX_STYLE_REFS}
                                >
                                    + 参考画像を追加
                                </button>
                                {styleReferences.length > 0 && (
                                    <ul className="paws-art-other__files">
                                        {styleReferences.map((f, i) => (
                                            <li key={`${f.name}-${i}`} className="paws-art-other__file">
                                                <span className="paws-art-other__filename">{f.name}</span>
                                                <button
                                                    type="button"
                                                    className="paws-art-other__remove"
                                                    onClick={() => removeStyleRef(i)}
                                                    aria-label={`${f.name} を削除`}
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {hasGoods && (
                <div className="paws-form-section__sub">
                    <label className="paws-gift-option" htmlFor="gift-wrap">
                        <span className="sr-only">
                            {GIFT_WRAP_OPTION.label}（{GIFT_WRAP_OPTION.priceLabel}）
                        </span>
                        <input
                            id="gift-wrap"
                            type="checkbox"
                            className="paws-gift-option__input"
                            checked={giftWrap}
                            onChange={(e) => {
                                setGiftWrap(e.target.checked);
                                if (!e.target.checked) setGiftMessage('');
                            }}
                        />
                        <span className="paws-gift-option__body">
                            <span className="paws-gift-option__head">
                                <span className="paws-gift-option__icon" aria-hidden="true">🎁</span>
                                {GIFT_WRAP_OPTION.label}
                                <span className="paws-gift-option__price">
                                    {GIFT_WRAP_OPTION.priceLabel}
                                </span>
                            </span>
                            <span className="paws-gift-option__desc">
                                大切な方への贈り物に。特別包装とメッセージカードをお付けします。
                            </span>
                            <span className="paws-gift-option__hint">
                                ✏️ 選択すると、下にメッセージカードに記入する内容を入力できます。
                            </span>
                        </span>
                    </label>

                    {giftWrap && (
                        <div className="paws-gift-message">
                            <label
                                htmlFor="gift-message"
                                className="paws-gift-message__label"
                            >
                                メッセージカードに記入する内容
                                <span className="paws-form-label__opt">（任意）</span>
                            </label>
                            <p className="paws-gift-message__help">
                                贈り先の方への一言を添えられます。空欄の場合はメッセージなしのカードをお付けします。
                            </p>
                            <textarea
                                id="gift-message"
                                className="paws-form-input paws-form-input--textarea"
                                rows={3}
                                maxLength={GIFT_MESSAGE_MAX}
                                value={giftMessage}
                                onChange={(e) => setGiftMessage(e.target.value)}
                                placeholder="例: いつもありがとう。お誕生日おめでとう！"
                            />
                            <p className="paws-gift-message__count">
                                {giftMessage.length} / {GIFT_MESSAGE_MAX}
                            </p>
                        </div>
                    )}
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
                                    loading="lazy"
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

            <Field label="ペットのお名前" optional>
                <input
                    type="text"
                    className="paws-form-input"
                    value={customer.petName}
                    onChange={updateCustomer('petName')}
                    placeholder="モカ"
                />
            </Field>

            <Field label="ペットの種類・特徴" optional>
                <textarea
                    className="paws-form-input paws-form-input--textarea"
                    rows={4}
                    value={customer.petDetail}
                    onChange={updateCustomer('petDetail')}
                    placeholder="例: ミニチュアダックスフンド・茶色・3歳・元気な男の子（写真から判断できる場合は未記入でもOK）"
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

function Step4Review({
    plan, goodsTypes, goodsDetails, artStyle, customStyle, styleReferences,
    giftWrap, giftMessage, photos, customer,
    // 金額・クーポン関連
    baseAmount, giftWrapAmount, discountAmount, totalAmount,
    couponCode, setCouponCode, appliedCoupon, onApplyCoupon, onClearCoupon,
    couponError, couponAgreed, setCouponAgreed,
    errors,
}) {
    const fmtGoods = (i) =>
        goodsTypes[i] + (goodsDetails[i] ? `（${goodsDetails[i]}）` : '');
    return (
        <section className="paws-form-section">
            <h2 className="paws-form-section__title">ご入力内容をご確認ください</h2>

            <div className="paws-review">
                <ReviewRow label="ご選択プラン">
                    <strong>{plan.name}</strong>（{plan.priceLabel}）
                    <div className="paws-review__sub">{plan.tagline}</div>
                </ReviewRow>

                {plan.id === 'pet-single' && goodsTypes[0] && (
                    <ReviewRow label="グッズ">{fmtGoods(0)}</ReviewRow>
                )}
                {plan.id === 'pet-pair' && (
                    <ReviewRow label="グッズ（2点）">
                        {fmtGoods(0)} ／ {fmtGoods(1)}
                    </ReviewRow>
                )}

                <ReviewRow label="画風">
                    {artStyleLabel(artStyle)}
                    {artStyle === 'other' && customStyle && (
                        <span className="paws-review__sub" style={{ whiteSpace: 'pre-line' }}>
                            ご希望: {customStyle}
                        </span>
                    )}
                    {artStyle === 'other' && styleReferences.length > 0 && (
                        <span className="paws-review__sub">
                            参考画像: {styleReferences.length}枚（{styleReferences.map((f) => f.name).join(' / ')}）
                        </span>
                    )}
                </ReviewRow>

                {giftWrap && (
                    <ReviewRow label="ギフトオプション">
                        {GIFT_WRAP_OPTION.label}（{GIFT_WRAP_OPTION.priceLabel}）
                    </ReviewRow>
                )}
                {giftWrap && giftMessage && (
                    <ReviewRow label="メッセージカード">
                        <span style={{ whiteSpace: 'pre-line' }}>{giftMessage}</span>
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
                                        loading="lazy"
                                    />
                                )
                        ))}
                    </div>
                </ReviewRow>

                <ReviewRow label="お名前">{customer.name}</ReviewRow>
                <ReviewRow label="メールアドレス">{customer.email}</ReviewRow>
                {customer.phone && <ReviewRow label="電話番号">{customer.phone}</ReviewRow>}
                {customer.petName && (
                    <ReviewRow label="ペットのお名前">{customer.petName}</ReviewRow>
                )}
                {customer.petDetail && (
                    <ReviewRow label="ペットの種類・特徴">
                        <span style={{ whiteSpace: 'pre-line' }}>{customer.petDetail}</span>
                    </ReviewRow>
                )}
                <ReviewRow label="郵便番号">{customer.postalCode}</ReviewRow>
                <ReviewRow label="ご住所">{customer.address}</ReviewRow>
                {customer.note && (
                    <ReviewRow label="備考">
                        <span style={{ whiteSpace: 'pre-line' }}>{customer.note}</span>
                    </ReviewRow>
                )}
            </div>

            {/* ── クーポン入力 ───────────────────────────────── */}
            <div className="paws-coupon">
                <p className="paws-form-label" style={{ margin: '0 0 0.5rem 0' }}>
                    クーポンコード
                    <span className="paws-form-label__opt">（お持ちの場合）</span>
                </p>
                <p className="paws-form-help" style={{ margin: '0 0 0.5rem 0' }}>
                    LINE 友だち追加や SNS キャンペーンで配布されたクーポンコードをお持ちの場合、こちらから適用できます。
                </p>

                {!appliedCoupon ? (
                    <div className="paws-coupon__entry">
                        <input
                            type="text"
                            className="paws-form-input"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="クーポンコードを入力"
                            aria-label="クーポンコード"
                        />
                        <button
                            type="button"
                            className="paws-form-btn paws-form-btn--secondary"
                            onClick={onApplyCoupon}
                            disabled={!couponCode.trim()}
                        >
                            適用
                        </button>
                    </div>
                ) : (
                    <div className="paws-coupon__applied">
                        <div className="paws-coupon__applied-head">
                            <span className="paws-coupon__badge">適用中</span>
                            <strong>{appliedCoupon.name}</strong>
                            <button
                                type="button"
                                className="paws-coupon__clear"
                                onClick={onClearCoupon}
                                aria-label="クーポンを取り消す"
                            >
                                取り消す
                            </button>
                        </div>
                        <p className="paws-coupon__desc">{appliedCoupon.description}</p>

                        {appliedCoupon.requiresAgreement && (
                            <label className="paws-coupon__agree">
                                <input
                                    type="checkbox"
                                    checked={couponAgreed}
                                    onChange={(e) => setCouponAgreed(e.target.checked)}
                                />
                                <span>{appliedCoupon.agreementText}</span>
                            </label>
                        )}
                    </div>
                )}
                {couponError && <p className="paws-form-error">{couponError}</p>}
                {errors?.coupon && <p className="paws-form-error">{errors.coupon}</p>}
            </div>

            {/* ── 金額サマリ ─────────────────────────────────── */}
            <div className="paws-amount-summary">
                <div className="paws-amount-summary__row">
                    <span>プラン料金</span>
                    <span>{formatYen(baseAmount)}</span>
                </div>
                {giftWrapAmount > 0 && (
                    <div className="paws-amount-summary__row">
                        <span>ギフト包装</span>
                        <span>+{formatYen(giftWrapAmount)}</span>
                    </div>
                )}
                {discountAmount > 0 && (
                    <div className="paws-amount-summary__row paws-amount-summary__row--discount">
                        <span>クーポン割引</span>
                        <span>-{formatYen(discountAmount)}</span>
                    </div>
                )}
                <div className="paws-amount-summary__row paws-amount-summary__row--total">
                    <span>合計</span>
                    <span>{formatYen(totalAmount)}</span>
                </div>
            </div>
        </section>
    );
}

// ── Step 5: Payment（モック決済） ──────────────────────

function Step5Payment({ plan, giftWrap, amount, card, updateCard }) {
    return (
        <section className="paws-form-section">
            <h2 className="paws-form-section__title">お支払い</h2>
            <p className="paws-form-help">
                お申し込みを確定するため、お支払い情報をご入力ください。
            </p>

            <div className="paws-pay-summary">
                <div className="paws-pay-summary__row">
                    <span>{plan.name}</span>
                    <span>{plan.priceLabel}</span>
                </div>
                {giftWrap && (
                    <div className="paws-pay-summary__row">
                        <span>ギフトオプション</span>
                        <span>{GIFT_WRAP_OPTION.priceLabel}</span>
                    </div>
                )}
                <div className="paws-pay-summary__row paws-pay-summary__row--total">
                    <span>合計（税込）</span>
                    <span>{formatYen(amount)}</span>
                </div>
            </div>

            {/* ★ ENGINEER CONNECTION POINT ★
                これはモックのカード入力UI。実決済は Stripe 等の決済プロバイダの
                Elements / Checkout に置き換える（カード番号を自前で保持しないこと）。 */}
            <div className="paws-pay-card">
                <Field label="カード番号">
                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        className="paws-form-input"
                        value={card.number}
                        onChange={updateCard('number')}
                        placeholder="1234 5678 9012 3456"
                    />
                </Field>
                <div className="paws-form-pair">
                    <Field label="有効期限 (MM/YY)">
                        <input
                            type="text"
                            autoComplete="cc-exp"
                            className="paws-form-input"
                            value={card.expiry}
                            onChange={updateCard('expiry')}
                            placeholder="12 / 28"
                        />
                    </Field>
                    <Field label="セキュリティコード">
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            className="paws-form-input"
                            value={card.cvc}
                            onChange={updateCard('cvc')}
                            placeholder="123"
                        />
                    </Field>
                </div>
                <Field label="カード名義">
                    <input
                        type="text"
                        autoComplete="cc-name"
                        className="paws-form-input"
                        value={card.holder}
                        onChange={updateCard('holder')}
                        placeholder="TARO YAMADA"
                    />
                </Field>
            </div>

            <p className="paws-form-help paws-form-help--note">
                🔒 SSL暗号化通信。これはデモ用のモック画面です（実際の決済は行われません）。
            </p>
        </section>
    );
}

// ── Completion screen ─────────────────────────────────

function CompletedScreen() {
    return (
        <div className="paws-completed">
            <div className="paws-completed__inner">
                <div className="paws-completed__mark" aria-hidden="true">✓</div>
                <h1 className="paws-completed__title">
                    ご注文<br />ありがとうございました
                </h1>
                <p className="paws-completed__text">
                    お支払いが完了しました。<br />
                    確認メールをお送りします。内容を拝見のうえ、3営業日以内にご連絡いたします。
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
    const navigate = useNavigate();
    const initialPlan = searchParams.get('plan') ?? '';

    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const [planId, setPlanId] = useState(
        pawspressPlans.find((p) => p.id === initialPlan) ? initialPlan : ''
    );
    const [goodsTypes, setGoodsTypes] = useState(['', '']);
    const [goodsDetails, setGoodsDetails] = useState(['', '']);
    const [artStyle, setArtStyle] = useState('character');
    const [customStyle, setCustomStyle] = useState('');
    const [styleReferences, setStyleReferences] = useState([]);
    const [giftWrap, setGiftWrap] = useState(false);
    const [giftMessage, setGiftMessage] = useState('');
    const [photos, setPhotos] = useState([]);
    const [customer, setCustomer] = useState({
        name: '', email: '', petName: '', petDetail: '',
        postalCode: '', address: '', phone: '', note: '',
    });
    const [card, setCard] = useState({ number: '', expiry: '', cvc: '', holder: '' });

    // ── クーポン関連 (Step4 で入力・適用) ────────────────────
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponAgreed, setCouponAgreed] = useState(false);
    const [couponError, setCouponError] = useState('');

    const selectedPlan = useMemo(
        () => pawspressPlans.find((p) => p.id === planId) ?? null,
        [planId]
    );

    // クーポン適用可否を再評価 (プラン変更時に無効化されるケースに備える)
    const couponValidForCurrentPlan = useMemo(
        () => isCouponApplicable(appliedCoupon, planId),
        [appliedCoupon, planId]
    );

    // クーポンの割引額 (基本料金に対する差額)
    const discountAmount = useMemo(() => {
        if (!appliedCoupon || !couponValidForCurrentPlan) return 0;
        // PROMO5500 系は requiresAgreement で同意していなければ割引適用しない
        if (appliedCoupon.requiresAgreement && !couponAgreed) return 0;
        return computeDiscount(appliedCoupon, selectedPlan?.price ?? 0);
    }, [appliedCoupon, couponValidForCurrentPlan, couponAgreed, selectedPlan]);

    const totalAmount = useMemo(() => {
        const base = selectedPlan?.price ?? 0;
        const hasGoods = planId === 'pet-single' || planId === 'pet-pair';
        const gift = hasGoods && giftWrap ? GIFT_WRAP_OPTION.price : 0;
        return Math.max(0, base + gift - discountAmount);
    }, [selectedPlan, planId, giftWrap, discountAmount]);

    const updateCustomer = (key) => (e) =>
        setCustomer((c) => ({ ...c, [key]: e.target.value }));

    const updateCard = (key) => (e) =>
        setCard((c) => ({ ...c, [key]: e.target.value }));

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
            if (!c.postalCode.trim()) next.postalCode = '郵便番号のご記入をお願いします。';
            else if (!isValidPostalCode(c.postalCode)) {
                next.postalCode = '郵便番号は7桁の数字でご記入ください（例: 1234567 / 123-4567）。';
            }
            if (!c.address.trim()) next.address = 'ご住所のご記入をお願いします。';
        } else if (s === 5) {
            if (!isCardComplete(card)) {
                next.card = 'カード情報をご確認ください。';
            }
        }
        return next;
    }, [planId, goodsTypes, photos, customer, card]);

    // 現ステップが「次へ進める状態か」（ボタンの彩度切替に使用）
    const stepValid = useMemo(
        () => Object.keys(validate(step)).length === 0,
        [validate, step]
    );

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

    // 「修正する」は確認(4)から1ステップずつ戻る（お客様情報へ）
    const handleEdit = () => {
        setErrors({});
        setStep((s) => Math.max(1, s - 1));
        scrollTop();
    };

    // 確認(4) → 送信: 即完了にせず、決済ステップ(5)へ進む
    // Stripe未設定（本番化前）はモック決済に進ませず、お問い合わせへ誘導する
    const handleApplyCoupon = () => {
        setCouponError('');
        setCouponAgreed(false);
        const coupon = findCoupon(couponCode);
        if (!coupon) {
            setAppliedCoupon(null);
            setCouponError('このクーポンコードは無効です。コードをご確認ください。');
            return;
        }
        if (!isCouponApplicable(coupon, planId)) {
            setAppliedCoupon(null);
            setCouponError(
                'このクーポンは現在ご選択中のプランには適用できません。対象プランをご確認ください。'
            );
            return;
        }
        setAppliedCoupon(coupon);
    };

    const handleClearCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponAgreed(false);
        setCouponError('');
    };

    const handleProceedToPayment = () => {
        // 同意が必要なクーポンを適用した場合、チェックが入っていなければブロック
        if (appliedCoupon?.requiresAgreement && !couponAgreed) {
            setErrors({ coupon: 'クーポン適用には掲載許諾への同意が必要です。' });
            return;
        }
        setErrors({});
        if (!isStripeConfigured) {
            navigate('/pet/contact');
            return;
        }
        setStep(5);
        scrollTop();
    };

    const handlePay = () => {
        const e = validate(5);
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        const hasGoods = planId === 'pet-single' || planId === 'pet-pair';
        const submission = {
            plan: selectedPlan,
            goodsTypes:
                planId === 'pet-single' ? [goodsTypes[0]]
                    : planId === 'pet-pair' ? goodsTypes
                        : [],
            goodsDetails:
                planId === 'pet-single' ? [goodsDetails[0]]
                    : planId === 'pet-pair' ? goodsDetails
                        : [],
            artStyle, // 'character' | 'realistic' | 'other'
            // 「その他のご相談」の自由記入テキスト + 参考画像
            // ★ ENGINEER CONNECTION POINT ★
            // styleReferences は dataUrl を含むため、実運用ではストレージへアップロードして
            //   URL/パス参照に置き換える。ここでは送信payloadでは metadata のみ残す。
            customStyle: artStyle === 'other' ? customStyle : '',
            styleReferences:
                artStyle === 'other'
                    ? styleReferences.map((f) => ({ name: f.name, size: f.size, type: f.type }))
                    : [],
            // ★ ENGINEER CONNECTION POINT ★
            // ギフトオプション(+¥3,300)は受注/決済処理で加算する。グッズ系プランのみ適用。
            giftWrap: hasGoods && giftWrap,
            giftMessage: hasGoods && giftWrap ? giftMessage : '',
            amount: totalAmount,
            // ★ ENGINEER CONNECTION POINT ★
            // 実決済は決済プロバイダ(Stripe等)に委譲。カード番号は送信ペイロードに含めない。
            paid: true,
            photos: photos.map((p) => ({ name: p.name, size: p.size, type: p.type })),
            customer,
            // クーポン情報 (適用されていれば metadata に残す)
            coupon: appliedCoupon
                ? {
                      code: appliedCoupon.code,
                      name: appliedCoupon.name,
                      type: appliedCoupon.type,
                      value: appliedCoupon.value,
                      discountAmount,
                      agreedToTerms: !!couponAgreed,
                  }
                : null,
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
                        goodsDetails={goodsDetails}
                        setGoodsDetails={setGoodsDetails}
                        artStyle={artStyle}
                        setArtStyle={(id) => {
                            setArtStyle(id);
                            if (id !== 'other') {
                                setCustomStyle('');
                                setStyleReferences([]);
                            }
                        }}
                        customStyle={customStyle}
                        setCustomStyle={setCustomStyle}
                        styleReferences={styleReferences}
                        setStyleReferences={setStyleReferences}
                        giftWrap={giftWrap}
                        setGiftWrap={setGiftWrap}
                        giftMessage={giftMessage}
                        setGiftMessage={setGiftMessage}
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
                        goodsDetails={goodsDetails}
                        artStyle={artStyle}
                        customStyle={customStyle}
                        styleReferences={styleReferences}
                        giftWrap={giftWrap}
                        giftMessage={giftMessage}
                        photos={photos}
                        customer={customer}
                        baseAmount={selectedPlan?.price ?? 0}
                        giftWrapAmount={
                            (planId === 'pet-single' || planId === 'pet-pair') && giftWrap
                                ? GIFT_WRAP_OPTION.price
                                : 0
                        }
                        discountAmount={discountAmount}
                        totalAmount={totalAmount}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode}
                        appliedCoupon={appliedCoupon}
                        onApplyCoupon={handleApplyCoupon}
                        onClearCoupon={handleClearCoupon}
                        couponError={couponError}
                        couponAgreed={couponAgreed}
                        setCouponAgreed={setCouponAgreed}
                        errors={errors}
                    />
                )}
                {step === 5 && (
                    <Step5Payment
                        plan={selectedPlan}
                        giftWrap={giftWrap}
                        amount={totalAmount}
                        card={card}
                        updateCard={updateCard}
                    />
                )}
            </div>

            <div className="paws-order__nav">
                {((step > 1 && step < 4) || step === 5) && (
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
                        className={`paws-form-btn paws-form-btn--primary paws-form-btn--${stepValid ? 'ready' : 'idle'}`}
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
                            onClick={handleProceedToPayment}
                            className="paws-form-btn paws-form-btn--primary paws-form-btn--ready"
                        >
                            {isStripeConfigured ? 'お支払いに進む →' : 'お問い合わせへ進む →'}
                        </button>
                    </>
                )}
                {step === 5 && (
                    <button
                        type="button"
                        onClick={handlePay}
                        className={`paws-form-btn paws-form-btn--primary paws-form-btn--${stepValid ? 'ready' : 'idle'}`}
                    >
                        {formatYen(totalAmount)} を支払う
                    </button>
                )}
            </div>
        </div>
    );
}
