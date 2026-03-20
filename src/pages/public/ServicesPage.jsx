import React from 'react';
import './ServicesPage.css';
import brandingStrategyImg from '../../assets/branding_strategy.png';
import studioGreetingImg from '../../assets/studio_greeting.png';
import Icon from '../../components/common/Icon';

export default function ServicesPage() {
    return (
        <div className="kb-newspaper-page">
            {/* --- Top Utility Bar --- */}
            <div className="kb-news-top-bar">
                <span className="kb-news-vol">第000027号</span>
                <span className="kb-news-date">2026年（令和8年）3月20日 金曜日</span>
                <div className="kb-news-color-toggle">
                    <span>単色</span>
                    <div className="kb-news-toggle-switch"></div>
                    <span>天然色</span>
                </div>
            </div>

            {/* --- Table / Layout Border --- */}
            <div className="kb-news-grid">
                
                {/* --- Left Column: Profile & Intro --- */}
                <aside className="kb-news-col kb-news-left">
                    <div className="kb-news-profile-header">
                        <span className="kb-news-badge-circle">日</span>
                        <h2 className="kb-news-profile-title">代表挨拶</h2>
                        <span className="kb-news-badge-circle">村</span>
                    </div>

                    <div className="kb-news-profile-img-box">
                        <img src={studioGreetingImg} alt="Studio Greeting" />
                    </div>

                    <h3 className="kb-news-intro-headline">「伝わらない」を、<br />利益に変える。</h3>
                    
                    <div className="kb-news-intro-text">
                        <p>カタチ便は、単なる「制作屋」ではありません。あなたのビジネスの核心を、顧客が即断できる「視覚資産」へと変換する戦略的パートナーです。</p>
                        <p>私たちは、情報の優先順位を整理し、顧客の意思決定を支援するコミュニケーションを設計します。デザインはコストではなく、利益を生むための投資であるべきです。</p>
                    </div>

                    <div style={{ borderTop: '2px dotted var(--kb-news-blue)', padding: '15px 0' }}>
                        <h4 className="vertical-rl" style={{ fontWeight: 900, color: 'var(--kb-news-magenta)', fontSize: '1.2rem', marginBottom: '10px' }}>理念</h4>
                        <p className="vertical-rl" style={{ color: 'var(--kb-news-magenta)', fontWeight: 'bold' }}>ビジネスの価値を、<br />世界へ正しく届ける。</p>
                    </div>
                </aside>

                {/* --- Center Column: Main News & Services --- */}
                <main className="kb-news-col kb-news-center">
                    <div className="kb-news-main-news">
                        <h2 className="kb-news-headline-vertical upright">
                            中小企業の<br />「視覚戦略」による<br />収益最大化を支援
                        </h2>
                        <div className="kb-news-article-lead">
                            <span className="kb-news-article-date">2026年03月20日（金曜日）</span>
                            <div className="kb-news-center-visual">
                                <span className="kb-news-badge-corner">注</span>
                                <span className="kb-news-badge-corner" style={{ top: 'auto', bottom: '10px', left: 'auto', right: '10px' }}>目</span>
                                <img src={brandingStrategyImg} alt="Branding Strategy" />
                            </div>
                        </div>
                    </div>

                    <div className="kb-news-list">
                        <div className="kb-news-item">
                            <div className="kb-news-icon-placeholder">
                                <Icon name="Palette" color="var(--kb-news-blue)" size={32} />
                            </div>
                            <div className="kb-news-item-content">
                                <h4>イラスト制作（戦略的メインビジュアル）</h4>
                                <p>単なる装飾ではなく、ターゲットの記憶に焼き付け、ブランドの世界観を瞬時に共有するための「顔」を構築します。</p>
                            </div>
                        </div>
                        <div className="kb-news-item">
                            <div className="kb-news-icon-placeholder">
                                <Icon name="BookOpen" color="var(--kb-news-blue)" size={32} />
                            </div>
                            <div className="kb-news-item-content">
                                <h4>漫画制作（CV改善ストーリー）</h4>
                                <p>複雑なサービス内容を共感のストーリーへ。顧客の懸念を払拭し、成約（CVR）を直接改善する強力な営業資産を提供します。</p>
                            </div>
                        </div>
                        <div className="kb-news-item">
                            <div className="kb-news-icon-placeholder">
                                <Icon name="BarChart" color="var(--kb-news-blue)" size={32} />
                            </div>
                            <div className="kb-news-item-content">
                                <h4>ビジュアル化・ブランディング（図解戦略）</h4>
                                <p>抽象的な強みを「即断できる」資料へ。一貫した視覚言語で、商談の成約率とブランドの市場優位性を高めます。</p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* --- Right Column: Branding & Sidebar --- */}
                <aside className="kb-news-col kb-news-right">
                    <div className="kb-news-brand-logo">
                        <div className="kb-news-brand-inner">
                            <Icon name="Package" color="white" size={40} />
                        </div>
                    </div>

                    <div className="kb-news-date-focus">
                        <span className="kb-news-year-bubble">2026</span>
                        <div className="kb-news-big-day">20</div>
                        <div className="kb-news-month-side">3月 弥生</div>
                    </div>

                    <div className="kb-news-weather-box">
                        <div className="kb-news-weather-item">
                            <span className="kb-news-weather-label">VISUAL</span>
                            <div className="kb-news-sun-icon">
                                <Icon name="Sparkles" color="var(--kb-news-blue)" size={20} />
                            </div>
                        </div>
                        <div className="kb-news-weather-item">
                            <span className="kb-news-weather-label">ROI-O</span>
                            <div className="kb-news-temp">120</div>
                        </div>
                    </div>

                    <div className="kb-news-editorial">
                        <div className="kb-news-editorial-label vertical-rl">定義</div>
                        <div className="kb-news-editorial-text vertical-rl">
                            「視覚戦略」とは、抽象的な価値を、人間が本能的に理解できる形へと変換し、意思決定の速度を速めるプロセスです。AIの速度と人間の文脈理解を融合させ、最適な「カタチ」を追求します。
                        </div>
                    </div>
                </aside>
            </div>

            {/* --- Pricing Roadmap Section (New) --- */}
            <section className="kb-news-pricing-section">
                <h3 className="kb-news-section-title">価格設計：利益を生み出すための3段階プラン</h3>
                <div className="kb-news-pricing-grid">
                    <div className="kb-price-card">
                        <div className="kb-price-header">ライト</div>
                        <div className="kb-price-value">¥50,000〜</div>
                        <div className="kb-price-desc">ビジュアル・クイック診断パック</div>
                        <ul className="kb-price-features">
                            <li>アイコン or 図解制作</li>
                            <li>30分戦略相談</li>
                            <li>起業初期の方向け</li>
                        </ul>
                    </div>
                    <div className="kb-price-card fb-gold">
                        <div className="kb-price-header">スタンダード</div>
                        <div className="kb-price-value">¥150,000〜</div>
                        <div className="kb-price-desc">ビジネス・コンバージョンパック</div>
                        <ul className="kb-price-features">
                            <li>メインビジュアル一式</li>
                            <li>広告漫画制作</li>
                            <li>運用改善コンサル</li>
                        </ul>
                    </div>
                    <div className="kb-price-card">
                        <div className="kb-price-header">プレミアム</div>
                        <div className="kb-price-value">¥500,000〜</div>
                        <div className="kb-price-desc">ブランド・トータル視覚戦略</div>
                        <ul className="kb-price-features">
                            <li>全ビジュアル設計</li>
                            <li>ブランドガイドライン</li>
                            <li>継続プラン策定</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* --- Bottom Area --- */}
            <footer className="kb-news-bottom">
                <div className="kb-news-corporate">
                    <div className="kb-news-corp-title">スタジオ情報</div>
                    <dl className="kb-news-corp-info">
                        <dt>名称</dt><dd>カタチ便 / ビジュアルデザイン室</dd>
                        <dt>代表者</dt><dd>ビジュアル・ストラテジスト</dd>
                        <dt>事業内容</dt><dd>イラスト制作・漫画制作・ブランディング支援</dd>
                        <dt>設立</dt><dd>令和4年10月14日</dd>
                    </dl>
                </div>
                <div className="kb-news-ad-box">
                    <div className="kb-news-ad-inner">
                        AIのスピード × 人間の情緒<br/>
                        次世代のクリエイティブ・パートナー
                    </div>
                </div>
                <div className="kb-news-contact-box">
                    <h3 className="kb-news-contact-header">あなたのビジネスの「視覚化」を、<br />今すぐ開始しませんか？</h3>
                    <p className="kb-news-contact-list">
                        ・「何をしているか」が伝わらない<br />
                        ・広告の成約率が上がらない<br />
                        ・プロフェッショナルな一貫性が欠けている
                    </p>
                    <a href="/intake" className="kb-news-contact-btn">視覚化診断を受ける（無料） ☞</a>
                </div>
            </footer>
        </div>
    );
}
