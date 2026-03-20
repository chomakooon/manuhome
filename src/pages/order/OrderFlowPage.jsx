import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ShoppingBag, Upload, Palette, ClipboardCheck, CreditCard, ArrowRight, ArrowLeft, Check, Loader, FileText, User } from 'lucide-react';
import FileUpload from '../../components/portal/FileUpload';
import { supabase } from '../../lib/supabase';
import { createCheckoutSession } from '../../lib/stripe';
import { formatPrice } from '../../lib/constants';
import template from '../../lib/templates/pet-illustration.json';
import './OrderFlowPage.css';

const ICON_MAP = {
    step_product: ShoppingBag,
    step_pet_info: FileText,
    step_style: Palette,
    step_assets: Upload,
    step_usage: ClipboardCheck,
    step_customer: User,
    step_confirm: CreditCard
};

export default function OrderFlowPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Dynamic Form State
    const [orderData, setOrderData] = useState({
        tier_id: '',
        selected_options: [],
        files: [],
        form_data: {}
    });

    const STEPS = template.formSteps;
    const currentStepConfig = STEPS.find(s => s.step === currentStep);

    // Calculate dynamic pricing
    const { basePrice, optionsTotal, totalPrice } = useMemo(() => {
        const tier = template.tiers.find(t => t.id === orderData.tier_id);
        const base = tier ? tier.price : 0;
        const opts = orderData.selected_options.map(optId => template.options.find(o => o.id === optId)?.price || 0);
        const optTotal = opts.reduce((a, b) => a + b, 0);
        return { basePrice: base, optionsTotal: optTotal, totalPrice: base + optTotal };
    }, [orderData.tier_id, orderData.selected_options]);

    const canProceed = () => {
        if (!currentStepConfig) return false;

        switch (currentStepConfig.type) {
            case 'product_selection':
                return !!orderData.tier_id;
            case 'custom_fields':
            case 'customer_info':
            case 'agreements':
                // Check all required fields in this step
                if (currentStepConfig.fields) {
                    for (const field of currentStepConfig.fields) {
                        if (field.required && !orderData.form_data[field.id]) {
                            return false;
                        }
                    }
                }
                // Check if all consent checkboxes are checked
                if (currentStepConfig.consentRequired) {
                    for (let i = 0; i < currentStepConfig.consentRequired.length; i++) {
                        if (!orderData.form_data[`consent_${currentStepConfig.id}_${i}`]) return false;
                    }
                }
                return true;
            case 'asset_upload':
                const min = currentStepConfig.minFiles || 1;
                return orderData.files.length >= min;
            case 'confirmation':
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (canProceed() && currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFieldChange = (fieldId, value) => {
        setOrderData(prev => {
            const newFormData = { ...prev.form_data, [fieldId]: value };
            const newOptions = [...prev.selected_options];

            // Handle triggers Option logic
            const currentField = currentStepConfig.fields?.find(f => f.id === fieldId);
            if (currentField && currentField.triggersOption) {
                // Remove all possible options this field could trigger
                Object.values(currentField.triggersOption).forEach(optId => {
                    const idx = newOptions.indexOf(optId);
                    if (idx > -1) newOptions.splice(idx, 1);
                });

                // Add the specific option if it matches the trigger
                const triggeredOpt = currentField.triggersOption[value];
                if (triggeredOpt && !newOptions.includes(triggeredOpt)) {
                    newOptions.push(triggeredOpt);
                }
            }

            return { ...prev, form_data: newFormData, selected_options: newOptions };
        });
    };

    const toggleOption = (optionId) => {
        setOrderData(prev => {
            const isSelected = prev.selected_options.includes(optionId);
            return {
                ...prev,
                selected_options: isSelected
                    ? prev.selected_options.filter(id => id !== optionId)
                    : [...prev.selected_options, optionId]
            };
        });
    };

    const handlePayment = async () => {
        if (!canProceed()) return;

        setLoading(true);
        try {
            const orderId = `order_${Date.now()}`;
            const assetUrls = [];
            const isDemo = import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL;

            // Upload files
            for (const fileObj of orderData.files) {
                if (isDemo) {
                    assetUrls.push(`demo_url_${fileObj.id}.jpg`);
                    continue;
                }
                const fileExt = fileObj.file.name.split('.').pop();
                const filePath = `assets/${orderId}/${fileObj.id}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, fileObj.file, { cacheControl: '3600', upsert: false });
                if (uploadError) throw new Error('ファイルのアップロードに失敗しました');
                const { data } = supabase.storage.from('project-files').getPublicUrl(filePath);
                if (data?.publicUrl) assetUrls.push(data.publicUrl);
            }

            // Create Stripe Session
            const result = await createCheckoutSession({
                productId: template.id,
                productName: `${template.name} (${template.tiers.find(t => t.id === orderData.tier_id)?.name})`,
                amount: totalPrice,
                orderId,
                customerEmail: orderData.form_data.email,
                assetUrls,
                tenantId: '00000000-0000-0000-0000-000000000000',
                metadata: {
                    template_id: template.id,
                    tier_id: orderData.tier_id,
                    selected_options: JSON.stringify(orderData.selected_options),
                    form_data: JSON.stringify(orderData.form_data)
                }
            });

            if (result.url) {
                if (result.url.startsWith('/')) navigate(result.url);
                else window.location.href = result.url;
            }
        } catch (err) {
            console.error('Payment error:', err);
            alert(err.message || 'お支払いの処理中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    // Render Field Helper
    const renderField = (field) => {
        const val = orderData.form_data[field.id] || '';
        if (field.type === 'select') {
            return (
                <div key={field.id} className="order-extra-field">
                    <label className="form-label">{field.label} {field.required && <span className="required">*</span>}</label>
                    <div className="order-style-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                        {field.options.map(opt => {
                            const optValue = typeof opt === 'object' ? opt.value : opt;
                            const optLabel = typeof opt === 'object' ? opt.label : opt;
                            const optIconName = typeof opt === 'object' ? opt.icon : null;
                            const IconComponent = optIconName && LucideIcons[optIconName] ? LucideIcons[optIconName] : null;
                            return (
                                <button
                                    key={optValue}
                                    type="button"
                                    className={`order-style-btn ${val === optValue ? 'order-style-btn--selected' : ''}`}
                                    onClick={() => handleFieldChange(field.id, optValue)}
                                >
                                    {IconComponent && <IconComponent className="order-style-icon" size={32} strokeWidth={1.5} />}
                                    <span>{optLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div key={field.id} className="order-extra-field">
                <label className="form-label">{field.label} {field.required && <span className="required">*</span>}</label>
                <input
                    type={field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                    className="form-input"
                    value={val}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    required={field.required}
                />
            </div>
        );
    };

    return (
        <div className="order-page">
            {/* Header */}
            <section className="order-hero section">
                <div className="container">
                    <p className="order-hero__badge">Order</p>
                    <h1 className="order-hero__title">
                        {template.name}<span className="text-gradient-warm">ご注文</span>
                    </h1>
                    <p className="section-subtitle">{template.description}</p>
                </div>
            </section>

            {/* Step Indicator */}
            <section className="order-steps-bar">
                <div className="container">
                    <div className="order-steps">
                        {STEPS.map((step, i) => {
                            const Icon = ICON_MAP[step.id] || Check;
                            return (
                                <div key={step.step} className="order-steps__item-wrap">
                                    <div className={`order-steps__item ${currentStep >= step.step ? 'order-steps__item--active' : ''} ${currentStep > step.step ? 'order-steps__item--done' : ''}`}>
                                        <div className="order-steps__circle">
                                            {currentStep > step.step ? <Check size={14} /> : <Icon size={14} />}
                                        </div>
                                        <span className="order-steps__label">{step.name}</span>
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`order-steps__line ${currentStep > step.step ? 'order-steps__line--done' : ''}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Step Content */}
            <section className="order-content section">
                <div className="container">
                    <div className="order-card">

                        {/* Step title */}
                        <h2 className="order-step__title">{currentStepConfig?.name}</h2>

                        {/* Dynamic Step Content */}
                        <div className="order-step">

                            {/* Product Selection Type */}
                            {currentStepConfig?.type === 'product_selection' && (
                                <>
                                    <p className="order-step__desc">ご希望のプランをお選びください。</p>
                                    <div className="order-products">
                                        {template.tiers.map((tier) => (
                                            <button
                                                key={tier.id}
                                                type="button"
                                                className={`order-product ${orderData.tier_id === tier.id ? 'order-product--selected' : ''}`}
                                                onClick={() => setOrderData(prev => ({ ...prev, tier_id: tier.id }))}
                                            >
                                                <div className="order-product__info">
                                                    <h3>{tier.name}</h3>
                                                    <p>{tier.description}</p>
                                                </div>
                                                <div className="order-product__price">
                                                    {formatPrice(tier.price)}<span>税込</span>
                                                </div>
                                                {orderData.tier_id === tier.id && <span className="order-product__check"><Check size={16} /></span>}
                                            </button>
                                        ))}
                                    </div>

                                    <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>オプションの追加</h3>
                                    <div className="order-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {template.options.map(opt => (
                                            <label key={opt.id} className={`order-product ${orderData.selected_options.includes(opt.id) ? 'order-product--selected' : ''}`} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '16px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={orderData.selected_options.includes(opt.id)}
                                                    onChange={() => toggleOption(opt.id)}
                                                    style={{ marginRight: '16px', width: '20px', height: '20px' }}
                                                />
                                                <div className="order-product__info" style={{ flex: 1 }}>
                                                    <h3 style={{ fontSize: '1rem', margin: '0 0 4px' }}>{opt.name}</h3>
                                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{opt.description}</p>
                                                </div>
                                                <div className="order-product__price">
                                                    +{formatPrice(opt.price)}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Asset Upload Type */}
                            {currentStepConfig?.type === 'asset_upload' && (
                                <>
                                    <p className="order-step__desc">写真をお送りください。（{currentStepConfig.minFiles}〜{currentStepConfig.maxFiles}枚）</p>
                                    {currentStepConfig.validationRules && (
                                        <div className="intake-note">
                                            <ul>
                                                {currentStepConfig.validationRules.map((rule, i) => <li key={i}>{rule}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    <FileUpload
                                        files={orderData.files}
                                        onChange={(files) => setOrderData(prev => ({ ...prev, files }))}
                                        maxFiles={currentStepConfig.maxFiles}
                                    />
                                    {currentStepConfig.consentRequired && (
                                        <div style={{ marginTop: '24px' }}>
                                            {currentStepConfig.consentRequired.map((consent, i) => (
                                                <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', marginBottom: '8px', fontSize: '0.9rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={orderData.form_data[`consent_${currentStepConfig.id}_${i}`] || false}
                                                        onChange={(e) => handleFieldChange(`consent_${currentStepConfig.id}_${i}`, e.target.checked)}
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                    {consent}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Custom Fields / Customer Info / Agreements Types */}
                            {(currentStepConfig?.type === 'custom_fields' || currentStepConfig?.type === 'customer_info' || currentStepConfig?.type === 'agreements') && (
                                <>
                                    {currentStepConfig.fields && (
                                        <div className="order-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {currentStepConfig.fields.map(renderField)}
                                        </div>
                                    )}

                                    {currentStepConfig.consentRequired && (
                                        <fieldset className="order-customer-info" style={{ marginTop: '32px' }}>
                                            <legend className="intake-legend">確認事項</legend>
                                            {currentStepConfig.consentRequired.map((consent, i) => (
                                                <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '12px', fontSize: '0.95rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={orderData.form_data[`consent_${currentStepConfig.id}_${i}`] || false}
                                                        onChange={(e) => handleFieldChange(`consent_${currentStepConfig.id}_${i}`, e.target.checked)}
                                                        style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                                                    />
                                                    {consent}
                                                </label>
                                            ))}
                                        </fieldset>
                                    )}
                                </>
                            )}

                            {/* Confirmation Type */}
                            {currentStepConfig?.type === 'confirmation' && (
                                <>
                                    <p className="order-step__desc">お支払いへ進みます</p>
                                    <div className="order-summary">
                                        <div className="order-summary__row">
                                            <span className="order-summary__label">プラン</span>
                                            <span className="order-summary__value">{template.tiers.find(t => t.id === orderData.tier_id)?.name}</span>
                                        </div>
                                        {orderData.selected_options.map(optId => {
                                            const opt = template.options.find(o => o.id === optId);
                                            return opt ? (
                                                <div key={opt.id} className="order-summary__row">
                                                    <span className="order-summary__label">オプション: {opt.name}</span>
                                                    <span className="order-summary__value">+{formatPrice(opt.price)}</span>
                                                </div>
                                            ) : null;
                                        })}
                                        <div className="order-summary__row order-summary__row--total">
                                            <span className="order-summary__label">合計金額</span>
                                            <span className="order-summary__value order-summary__price">
                                                {formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-payment-note">
                                        <p>お支払い完了後、自動的にプロジェクトが作成されます。</p>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-lg order-pay-btn"
                                        onClick={handlePayment}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><Loader size={18} className="spin" /> 処理中...</>
                                        ) : (
                                            <><CreditCard size={18} /> お支払いへ進む</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="order-nav">
                            {currentStep > 1 && (
                                <button className="btn btn-outline order-nav__back" onClick={prevStep} disabled={loading}>
                                    <ArrowLeft size={16} /> 戻る
                                </button>
                            )}
                            {currentStepConfig?.type !== 'confirmation' && (
                                <button
                                    className="btn btn-primary order-nav__next"
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                >
                                    次へ <ArrowRight size={16} />
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
