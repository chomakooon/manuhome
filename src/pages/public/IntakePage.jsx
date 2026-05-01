import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase, Dog, Users, MessageCircle, Send } from 'lucide-react';
import './IntakePage.css';

const INQUIRY_TYPES = [
    { value: 'business', label: 'イラスト・漫画 / AI手直し', icon: <Briefcase size={24} strokeWidth={1.5} />, description: 'ビジネス向けクリエイティブ制作', color: 'var(--color-business)' },
    { value: 'pet', label: 'ペットグッズ制作', icon: <Dog size={24} strokeWidth={1.5} />, description: 'オリジナルペットグッズの制作', color: 'var(--color-pet)' },
    { value: 'networking', label: '交流会への参加', icon: <Users size={24} strokeWidth={1.5} />, description: 'クリエイター交流会への参加申込み', color: 'var(--color-networking)' },
    { value: 'other', label: 'その他のご相談', icon: <MessageCircle size={24} strokeWidth={1.5} />, description: 'その他のお問い合わせ', color: 'var(--color-contact)' },
];

const GOAL_OPTIONS = [
    '売上・集客アップ',
    'ブランディング強化',
    'SNS運用の強化',
    '採用・社内広報',
    'プレゼント・記念品',
    'その他',
];

const BUDGET_OPTIONS = [
    '〜3万円',
    '3万〜5万円',
    '5万〜10万円',
    '10万〜30万円',
    '30万円以上',
    '未定・相談したい',
];

export default function IntakePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        inquiryType: '',
        name: '',
        company: '',
        email: '',
        sns: '',
        goal: '',
        budget_range: '',
        deadline: '',
        message: '',
        // business specific
        use_case: '',
        media_type: '',
        target: '',
        tone: '',
        // pet specific
        pet_count: '',
        style: '',
        goods_type: '',
        // networking specific
        purpose: '',
        preferred_date: '',
        // other
        free_detail: '',
    });

    useEffect(() => {
        const type = searchParams.get('type');
        if (type && INQUIRY_TYPES.some(t => t.value === type)) {
            setFormData(prev => ({ ...prev, inquiryType: type }));
            setStep(2);
        }
    }, [searchParams]);

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, inquiryType: type }));
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Build structured data for backend
        const commonFields = {
            inquiryType: formData.inquiryType,
            name: formData.name,
            company: formData.company,
            email: formData.email,
            sns: formData.sns,
            goal: formData.goal,
            budget_range: formData.budget_range,
            deadline: formData.deadline,
            message: formData.message,
        };

        let detailsJson = {};
        switch (formData.inquiryType) {
            case 'business':
                detailsJson = {
                    use_case: formData.use_case,
                    media_type: formData.media_type,
                    target: formData.target,
                    tone: formData.tone,
                };
                break;
            case 'pet':
                detailsJson = {
                    pet_count: formData.pet_count,
                    style: formData.style,
                    goods_type: formData.goods_type,
                };
                break;
            case 'networking':
                detailsJson = {
                    purpose: formData.purpose,
                    preferred_date: formData.preferred_date,
                };
                break;
            case 'other':
                detailsJson = {
                    free_detail: formData.free_detail,
                };
                break;
        }

        const submissionData = {
            ...commonFields,
            detailsJson: JSON.stringify(detailsJson),
            submittedAt: new Date().toISOString(),
        };

        // Send to CROWN Hub webhook (fire-and-forget — UX不変)
        const HUB_WEBHOOK = import.meta.env.VITE_CROWN_HUB_URL
            ? `${import.meta.env.VITE_CROWN_HUB_URL}/api/webhooks/portfolio`
            : null;

        if (HUB_WEBHOOK) {
            fetch(HUB_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            }).catch((err) => console.warn('Hub webhook failed (non-blocking):', err));
        }

        navigate('/thanks');
    };

    const goBack = () => {
        setStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="intake-page">
            <section className="intake-hero section">
                <div className="container">
                    <p className="intake-hero__badge">Contact</p>
                    <h1 className="intake-hero__title">お問い合わせ</h1>
                    <p className="section-subtitle">
                        まずはご相談内容のカテゴリをお選びください
                    </p>

                    {/* Step Indicator */}
                    <div className="intake-steps">
                        <div className={`intake-steps__item ${step >= 1 ? 'intake-steps__item--active' : ''}`}>
                            <span className="intake-steps__num">1</span>
                            <span className="intake-steps__label">カテゴリ選択</span>
                        </div>
                        <div className="intake-steps__line" />
                        <div className={`intake-steps__item ${step >= 2 ? 'intake-steps__item--active' : ''}`}>
                            <span className="intake-steps__num">2</span>
                            <span className="intake-steps__label">詳細入力</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="intake-form section">
                <div className="container">
                    {step === 1 ? (
                        /* Step 1: Type Selection */
                        <div className="intake-type-grid">
                            {INQUIRY_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    className={`intake-type-card ${formData.inquiryType === type.value ? 'intake-type-card--selected' : ''}`}
                                    onClick={() => handleTypeSelect(type.value)}
                                    style={{ '--type-color': type.color }}
                                >
                                    <span className="intake-type-card__icon">{type.icon}</span>
                                    <span className="intake-type-card__label">{type.label}</span>
                                    <span className="intake-type-card__desc">{type.description}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Step 2: Form */
                        <form className="intake-fields" onSubmit={handleSubmit}>
                            <button type="button" className="intake-back" onClick={goBack}>
                                ← カテゴリ選択に戻る
                            </button>

                            <div className="intake-selected-type">
                                <span>{INQUIRY_TYPES.find(t => t.value === formData.inquiryType)?.icon}</span>
                                <span>{INQUIRY_TYPES.find(t => t.value === formData.inquiryType)?.label}</span>
                            </div>

                            {/* Common Fields */}
                            <fieldset className="intake-fieldset">
                                <legend className="intake-legend">基本情報</legend>

                                <div className="form-group">
                                    <label className="form-label">お名前 <span className="required">*</span></label>
                                    <input type="text" name="name" className="form-input" value={formData.name}
                                        onChange={handleChange} required placeholder="山田太郎" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">会社名・屋号</label>
                                    <input type="text" name="company" className="form-input" value={formData.company}
                                        onChange={handleChange} placeholder="株式会社サンプル（任意）" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">メールアドレス <span className="required">*</span></label>
                                    <input type="email" name="email" className="form-input" value={formData.email}
                                        onChange={handleChange} required placeholder="example@email.com" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">SNSアカウント</label>
                                    <input type="text" name="sns" className="form-input" value={formData.sns}
                                        onChange={handleChange} placeholder="@your_account（任意）" />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">目的 <span className="required">*</span></label>
                                        <select name="goal" className="form-select" value={formData.goal}
                                            onChange={handleChange} required>
                                            <option value="">選択してください</option>
                                            {GOAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">予算感 <span className="required">*</span></label>
                                        <select name="budget_range" className="form-select" value={formData.budget_range}
                                            onChange={handleChange} required>
                                            <option value="">選択してください</option>
                                            {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">希望納期</label>
                                    <input type="text" name="deadline" className="form-input" value={formData.deadline}
                                        onChange={handleChange} placeholder="例: 3月末まで、1ヶ月以内 など" />
                                </div>
                            </fieldset>

                            {/* Conditional Fields */}
                            {formData.inquiryType === 'business' && (
                                <fieldset className="intake-fieldset">
                                    <legend className="intake-legend">制作の詳細</legend>
                                    <div className="form-group">
                                        <label className="form-label">用途</label>
                                        <select name="use_case" className="form-select" value={formData.use_case} onChange={handleChange}>
                                            <option value="">選択してください</option>
                                            <option value="lp">LP・ランディングページ</option>
                                            <option value="sns_ad">SNS広告</option>
                                            <option value="recruit">採用・社内向け</option>
                                            <option value="presentation">プレゼン・資料</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">メディア種別</label>
                                        <select name="media_type" className="form-select" value={formData.media_type} onChange={handleChange}>
                                            <option value="">選択してください</option>
                                            <option value="manga">漫画</option>
                                            <option value="illustration">イラスト</option>
                                            <option value="ai_retouch">AI画像手直し</option>
                                            <option value="mixed">複合</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ターゲット</label>
                                        <input type="text" name="target" className="form-input" value={formData.target}
                                            onChange={handleChange} placeholder="例: 30代女性、中小企業の経営者 など" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">トーン・雰囲気</label>
                                        <input type="text" name="tone" className="form-input" value={formData.tone}
                                            onChange={handleChange} placeholder="例: 親しみやすい、プロフェッショナル、ポップ など" />
                                    </div>
                                </fieldset>
                            )}

                            {formData.inquiryType === 'pet' && (
                                <fieldset className="intake-fieldset">
                                    <legend className="intake-legend">ペットグッズの詳細</legend>
                                    <div className="form-group">
                                        <label className="form-label">ペットの数</label>
                                        <select name="pet_count" className="form-select" value={formData.pet_count} onChange={handleChange}>
                                            <option value="">選択してください</option>
                                            <option value="1">1匹</option>
                                            <option value="2">2匹</option>
                                            <option value="3+">3匹以上</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">イラストのスタイル</label>
                                        <select name="style" className="form-select" value={formData.style} onChange={handleChange}>
                                            <option value="">選択してください</option>
                                            <option value="realistic">リアル風</option>
                                            <option value="cute">かわいい系</option>
                                            <option value="simple">シンプル</option>
                                            <option value="watercolor">水彩風</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">グッズの種類</label>
                                        <select name="goods_type" className="form-select" value={formData.goods_type} onChange={handleChange}>
                                            <option value="">選択してください</option>
                                            <option value="mug">マグカップ</option>
                                            <option value="tshirt">Tシャツ</option>
                                            <option value="phone_case">スマホケース</option>
                                            <option value="canvas">キャンバス</option>
                                            <option value="other">その他・相談したい</option>
                                        </select>
                                    </div>
                                </fieldset>
                            )}

                            {formData.inquiryType === 'networking' && (
                                <fieldset className="intake-fieldset">
                                    <legend className="intake-legend">交流会の詳細</legend>
                                    <div className="form-group">
                                        <label className="form-label">参加の目的</label>
                                        <input type="text" name="purpose" className="form-input" value={formData.purpose}
                                            onChange={handleChange} placeholder="例: 人脈づくり、コラボ先探し、勉強 など" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">希望日程</label>
                                        <input type="text" name="preferred_date" className="form-input" value={formData.preferred_date}
                                            onChange={handleChange} placeholder="例: 3月の週末、平日夜 など" />
                                    </div>
                                </fieldset>
                            )}

                            {formData.inquiryType === 'other' && (
                                <fieldset className="intake-fieldset">
                                    <legend className="intake-legend">ご相談の詳細</legend>
                                    <div className="form-group">
                                        <label className="form-label">詳しい内容</label>
                                        <textarea name="free_detail" className="form-textarea" value={formData.free_detail}
                                            onChange={handleChange} placeholder="ご相談内容を自由にご記入ください" rows={5} />
                                    </div>
                                </fieldset>
                            )}

                            {/* Message */}
                            <fieldset className="intake-fieldset">
                                <legend className="intake-legend">メッセージ</legend>
                                <div className="form-group">
                                    <label className="form-label">その他、伝えたいこと</label>
                                    <textarea name="message" className="form-textarea" value={formData.message}
                                        onChange={handleChange} placeholder="補足情報やご希望があればご記入ください" rows={4} />
                                </div>
                            </fieldset>

                            <button type="submit" className="btn btn-primary btn-lg intake-submit">
                                <Send size={18} strokeWidth={2} /> 相談内容を送る
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
