import React, { useState, useEffect } from 'react';
import { submitOrder } from '../../lib/orderService';
import Icon from '../../components/common/Icon';
import './OrderPage.css';

export default function OrderPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        setErrorMessage('');
        
        try {
            const form = e.target;
            const formData = new FormData(form);
            
            // Collect fields into an object
            const data = Object.fromEntries(formData.entries());

            // Add file stub logic if reference file exists
            const fileField = document.getElementById('reference');
            if (fileField.files.length > 0) {
                const file = fileField.files[0];
                data.referenceFileName = file.name;
                // Currently, file uploading to Supabase Storage is not handled 
                // in this phase. Real file upload can be added later.
            }

            console.log("Submitting order payload:", data);

            // Call the Order Service
            const response = await submitOrder(data);

            if (!response.success) {
                throw new Error(response.error || '予期せぬエラーが発生しました。');
            }
            
            setSubmitStatus('success');
            form.reset();

        } catch (error) {
            console.error("Order submission failed:", error);
            setSubmitStatus('error');
            setErrorMessage(error.message || '送信に失敗しました。時間をおいて再度お試しください。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="order-page">
            {/* HERO SECTION */}
            <section className="order-hero">
                <div className="order-container">
                    <h1 className="order-hero-title">制作のご注文</h1>
                    <p className="order-hero-subtitle">カタチ便へのご依頼・お見積もりはこちらから</p>
                </div>
            </section>

            {/* 1. PRICING PLAN */}
            <section className="order-section bg-light">
                <div className="order-container">
                    <h2 className="order-section-title">料金プラン</h2>
                    <p className="order-section-desc">ご依頼内容に合わせた基準価格です。詳細はお見積り時に決定いたします。</p>
                    
                    <div className="order-pricing-grid">
                        <div className="pricing-card">
                            <div className="pricing-icon">
                                <Icon name="User" color="var(--color-accent)" size={40} />
                            </div>
                            <h3 className="pricing-name">SNSアイコン</h3>
                            <p className="pricing-price">¥5,000<span>〜</span></p>
                            <p className="pricing-detail">X(Twitter)やInstagramなどで使える、親しみやすいアイコン制作。</p>
                        </div>
                        <div className="pricing-card">
                            <div className="pricing-icon">
                                <Icon name="MessageSquare" color="var(--color-accent)" size={40} />
                            </div>
                            <h3 className="pricing-name">ビジネス4コマ</h3>
                            <p className="pricing-price">¥15,000<span>〜</span></p>
                            <p className="pricing-detail">サービス内容や商品紹介を、わかりやすい4コマ漫画で表現。</p>
                        </div>
                        <div className="pricing-card">
                            <div className="pricing-icon">
                                <Icon name="Palette" color="var(--color-accent)" size={40} />
                            </div>
                            <h3 className="pricing-name">似顔絵</h3>
                            <p className="pricing-price">¥8,000<span>〜</span></p>
                            <p className="pricing-detail">名刺やプロフィールに使える、特徴を捉えた温かみのある似顔絵。</p>
                        </div>
                        <div className="pricing-card">
                            <div className="pricing-icon">
                                <Icon name="BarChart" color="var(--color-accent)" size={40} />
                            </div>
                            <h3 className="pricing-name">図解</h3>
                            <p className="pricing-price">¥10,000<span>〜</span></p>
                            <p className="pricing-detail">複雑なビジネスモデルや手順を、直感的に伝わる図解ビジュアルに。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WORKFLOW (Before Form makes more sense, but staying true to structure or logical flow) */}
            <section className="order-section">
                <div className="order-container">
                    <h2 className="order-section-title">制作の流れ</h2>
                    <div className="order-workflow">
                        <div className="workflow-step">
                            <div className="workflow-number">1</div>
                            <h4>相談</h4>
                            <p>フォームよりご依頼内容をお送りください。ヒアリングを行います。</p>
                        </div>
                        <div className="workflow-arrow">▶︎</div>
                        <div className="workflow-step">
                            <div className="workflow-number">2</div>
                            <h4>ラフ</h4>
                            <p>構成案やラフスケッチを作成し、方向性を確認していただきます。</p>
                        </div>
                        <div className="workflow-arrow">▶︎</div>
                        <div className="workflow-step">
                            <div className="workflow-number">3</div>
                            <h4>制作</h4>
                            <p>本制作に進みます。必要に応じて修正（基本2回まで）を行います。</p>
                        </div>
                        <div className="workflow-arrow">▶︎</div>
                        <div className="workflow-step">
                            <div className="workflow-number">4</div>
                            <h4>納品</h4>
                            <p>完成データ（PNG/JPG/PSD等）を納品いたします。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. DELIVERY TIME */}
            <section className="order-section bg-light">
                <div className="order-container">
                    <h2 className="order-section-title">納期</h2>
                    <div className="delivery-card-wrapper">
                        <div className="delivery-card">
                            <h4>通常納期</h4>
                            <p>ヒアリング完了後、<strong>約1〜2週間</strong>でのご納品となります。<br/>※ご依頼のボリュームによって変動します。</p>
                        </div>
                        <div className="delivery-card">
                            <h4>特急対応</h4>
                            <p>お急ぎの場合は、<strong>最短3日〜</strong>での対応もご相談可能です。<br/>※特急料金（合計金額の30%〜）が別途発生する場合がございます。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ORDER FORM */}
            <section className="order-section" id="order-form-section">
                <div className="order-container">
                    <h2 className="order-section-title">注文フォーム</h2>
                    <p className="order-section-desc">以下のフォームに必要事項をご記入の上、送信してください。</p>

                    <form className="order-form" onSubmit={handleSubmit}>
                        {submitStatus === 'success' && (
                            <div className="form-alert success">
                                <strong>送信完了</strong><br/>
                                ご注文ありがとうございます。内容を確認次第、折り返しご連絡いたします。
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="form-alert error">
                                <strong>送信エラー</strong><br/>
                                {errorMessage}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="name">お名前 <span className="required">必須</span></label>
                            <input type="text" id="name" name="name" placeholder="山田 太郎" required disabled={isSubmitting} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">メールアドレス <span className="required">必須</span></label>
                            <input type="email" id="email" name="email" placeholder="example@katachi.com" required disabled={isSubmitting} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sns">SNSリンク / アカウントID</label>
                            <input type="text" id="sns" name="sns" placeholder="https://x.com/username または @username" disabled={isSubmitting} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">依頼カテゴリ <span className="required">必須</span></label>
                            <div className="select-wrapper">
                                <select id="category" name="category" required disabled={isSubmitting}>
                                    <option value="">選択してください</option>
                                    <option value="SNSアイコン">SNSアイコン</option>
                                    <option value="似顔絵">似顔絵</option>
                                    <option value="ビジネス4コマ">ビジネス4コマ</option>
                                    <option value="図解イラスト">図解イラスト</option>
                                    <option value="その他">その他・相談したい</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="usage">用途</label>
                            <input type="text" id="usage" name="usage" placeholder="例：コーポレートサイト、SNS運用、印刷物など" disabled={isSubmitting} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="details">依頼内容 <span className="required">必須</span></label>
                            <textarea id="details" name="details" rows="5" placeholder="例：自社サービスの解説用ビジネス4コマを1本依頼したいです。ターゲットは〇〇で..." required disabled={isSubmitting}></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="reference">参考画像</label>
                            <input type="file" id="reference" name="reference" accept="image/*" disabled={isSubmitting} />
                            <small className="form-help">イメージに近い画像や資料があれば添付してください（最大容量に注意してください）。</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="deadline">納期希望</label>
                            <input type="date" id="deadline" name="deadline" disabled={isSubmitting} />
                        </div>

                        <div className="form-submit">
                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? '送信中...' : '入力内容を送信する'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

        </div>
    );
}
