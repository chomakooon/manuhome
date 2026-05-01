import React from 'react';
import './ServicesPage.css';
import brandingStrategyImg from '../../assets/branding_strategy.png';
import studioGreetingImg from '../../assets/studio_greeting.png';
import orderFlowManga from '../../assets/order_flow_manga.png';
import pixelDove from '../../assets/pixel_art_dove.png';
import Icon from '../../components/common/Icon';

export default function ServicesPage() {
    return (
        <div className="kb-newspaper-page">
            {/* --- Top Utility Bar --- */}
            <div className="kb-news-top-bar">
                <span className="kb-news-vol">第000027号</span>
                <span className="kb-news-date">2026年（令和8年）3月20日 金曜日</span>
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
                        <img src={studioGreetingImg} alt="カタチ便 代表 — ビジュアルデザイナー まぬちゃん" />
                    </div>

                    <h3 className="kb-news-intro-headline">「伝わらない」を、<br />利益に変える。</h3>
                    
                    <div className="kb-news-intro-text">
                        <p>カタチ便は、単なる「制作屋」ではありません。あなたのビジネスの核心を、顧客が即断できる「視覚資産」へと変換する戦略的パートナーです。</p>
                        <p>私たちは、情報の優先順位を整理し、顧客の意思決定を支援するビジュアルコミュニケーションを設計します。デザインはコストではなく、利益を生むための投資であるべきです。</p>
                        <p>個人事業主から中小企業まで、「デザイナーを使うほどではないけど、プロの力が必要」という方に向けて、手の届く価格で高品質なビジュアルを提供しています。</p>
                    </div>

                    <div style={{ borderTop: '2px dotted var(--kb-news-blue)', padding: '15px 0' }}>
                        <h4 className="vertical-rl" style={{ fontWeight: 900, color: 'var(--kb-news-magenta)', fontSize: '1.2rem', marginBottom: '10px' }}>理念</h4>
                        <p className="vertical-rl" style={{ color: 'var(--kb-news-magenta)', fontWeight: 'bold' }}>ビジネスの価値を、<br />世界へ正しく届ける。</p>
                    </div>

                    {/* 実績ハイライト */}
                    <div className="kb-news-stats-box">
                        <h4>実績ハイライト</h4>
                        <dl className="kb-news-stats-list">
                            <div className="kb-news-stat-item">
                                <dt>制作実績</dt>
                                <dd>100件以上</dd>
                            </div>
                            <div className="kb-news-stat-item">
                                <dt>リピート率</dt>
                                <dd>85%</dd>
                            </div>
                            <div className="kb-news-stat-item">
                                <dt>対応業種</dt>
                                <dd>20業種以上</dd>
                            </div>
                        </dl>
                    </div>
                </aside>

                {/* --- Center Column: Main News & Services --- */}
                <main className="kb-news-col kb-news-center">
                    <div className="kb-news-main-news">
                        <h2 className="kb-news-headline-horizontal">
                            中小企業の「視覚戦略」による<br />収益最大化を支援
                        </h2>
                        <div className="kb-news-article-lead">
                            <span className="kb-news-article-date">2026年03月20日（金曜日）</span>
                            <div className="kb-news-center-visual">
                                <span className="kb-news-badge-corner">注</span>
                                <span className="kb-news-badge-corner" style={{ top: 'auto', bottom: '10px', left: 'auto', right: '10px' }}>目</span>
                                <img src={brandingStrategyImg} alt="カタチ便のブランディング戦略 ― ビジュアルで収益を加速" />
                            </div>
                            <p className="kb-news-article-body">
                                「伝えたい価値はあるのに、顧客に正しく伝わっていない」――この悩みは、個人事業主・中小企業に共通する最大の課題です。カタチ便は、イラスト・漫画・図解を戦略的に活用し、0.1秒で顧客の心をつかむビジュアルを設計。ビジネスの成長を視覚面から支援します。
                            </p>
                        </div>
                    </div>

                    <div className="kb-news-list">
                        <div className="kb-news-item">
                            <div className="kb-news-icon-placeholder">
                                <Icon name="Palette" color="var(--kb-news-blue)" size={32} />
                            </div>
                            <div className="kb-news-item-content">
                                <h4>イラスト制作（戦略的メインビジュアル）</h4>
                                <p>SNSアイコン、Webサイト素材、商品パッケージまで対応。ターゲットの記憶に焼き付き、ブランドの世界観を瞬時に共有する「視覚の顔」を構築します。世界観に合わせたオリジナルイラストで、競合との差別化を実現。</p>
                            </div>
                        </div>
                        <div className="kb-news-item">
                            <div className="kb-news-icon-placeholder">
                                <Icon name="BookOpen" color="var(--kb-news-blue)" size={32} />
                            </div>
                            <div className="kb-news-item-content">
                                <h4>漫画制作（成約率改善ストーリー）</h4>
                                <p>複雑なサービス内容を共感のストーリーへ変換。「これ、私のことだ」と思わせる脚本設計で、顧客の懸念を払拭。成約率（CVR）を直接改善する広告漫画を、企画からネーム・仕上げまで一貫して制作します。</p>
                            </div>
                        </div>
                        <div className="kb-news-item">
                            <div className="kb-news-icon-placeholder">
                                <Icon name="BarChart" color="var(--kb-news-blue)" size={32} />
                            </div>
                            <div className="kb-news-item-content">
                                <h4>ビジュアル化・ブランディング（図解戦略）</h4>
                                <p>抽象的なビジネスの強みを「一目で即断できる」図解へ。プレゼン資料、LP、営業資料まで、一貫した視覚言語で商談の成約率とブランドの市場優位性を高めます。複雑なビジネスモデルもシンプルに図解化。</p>
                            </div>
                        </div>
                    </div>

                    {/* 制作事例セクション */}
                    <div className="kb-news-case-studies">
                        <h3 className="kb-news-case-title">こんなお悩みを解決してきました</h3>
                        <div className="kb-news-case-grid">
                            <div className="kb-news-case-card">
                                <Icon name="Store" color="var(--kb-news-blue)" size={24} />
                                <h4>飲食店のSNS集客</h4>
                                <p>「料理は美味しいのに写真映えしない」→ オリジナルイラストメニューで Instagram フォロワーが2倍に</p>
                            </div>
                            <div className="kb-news-case-card">
                                <Icon name="Laptop" color="var(--kb-news-blue)" size={24} />
                                <h4>SaaS企業の資料改善</h4>
                                <p>「機能説明が複雑で伝わらない」→ ビジネスモデル図解でリード獲得率が40%改善</p>
                            </div>
                            <div className="kb-news-case-card">
                                <Icon name="Heart" color="var(--kb-news-blue)" size={24} />
                                <h4>個人サロンのブランディング</h4>
                                <p>「他店との違いが伝わらない」→ 世界観統一のビジュアル一式でリピート率15%向上</p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* --- Right Column: Branding & Sidebar --- */}
                <aside className="kb-news-col kb-news-right">
                    <div className="kb-news-brand-logo">
                        <div className="kb-news-brand-inner">
                            <img src={pixelDove} alt="カタチ便" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
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
                        <div className="kb-news-editorial-label vertical-rl">社説</div>
                        <div className="kb-news-editorial-text vertical-rl">
                            「視覚戦略」とは、抽象的な価値を、人間が本能的に理解できる形へと変換し、意思決定の速度を加速させるプロセスです。AIの処理速度と人間の文脈理解を融合させ、最適な「カタチ」を追求します。優れたビジュアルは、言葉を超え、文化を超え、瞬時に価値を届ける力を持ちます。
                        </div>
                    </div>

                    {/* 制作フロー4コマ */}
                    <div className="kb-news-manga-sidebar">
                        <h4 className="kb-news-manga-label">▼ 制作の流れ</h4>
                        <img src={orderFlowManga} alt="カタチ便 注文フロー 4コマ漫画：悩み相談→依頼→制作→納品" className="kb-news-manga-thumb" />
                    </div>
                </aside>
            </div>

            {/* --- Pricing Roadmap Section --- */}
            <section className="kb-news-pricing-section" aria-label="料金プラン">
                <h3 className="kb-news-section-title">料金プラン：ビジネスステージに合わせた3段階</h3>
                <div className="kb-news-pricing-grid">
                    <div className="kb-price-card">
                        <div className="kb-price-header">ライト</div>
                        <div className="kb-price-value">¥50,000〜</div>
                        <div className="kb-price-desc">個人事業主・起業初期の方に<br/>ビジュアル・クイック診断パック</div>
                        <ul className="kb-price-features">
                            <li>アイコン or 図解制作（1点）</li>
                            <li>30分 戦略ヒアリング</li>
                            <li>SNS用素材への最適化</li>
                            <li>納期：最短3営業日〜</li>
                        </ul>
                    </div>
                    <div className="kb-price-card fb-gold">
                        <div className="kb-price-header">スタンダード</div>
                        <div className="kb-price-value">¥150,000〜</div>
                        <div className="kb-price-desc">成約率を上げたい事業者に<br/>ビジネス・コンバージョンパック</div>
                        <ul className="kb-price-features">
                            <li>メインビジュアル一式</li>
                            <li>広告漫画 or 図解セット</li>
                            <li>ブランドカラー提案</li>
                            <li>運用改善コンサル付き</li>
                        </ul>
                    </div>
                    <div className="kb-price-card">
                        <div className="kb-price-header">プレミアム</div>
                        <div className="kb-price-value">¥500,000〜</div>
                        <div className="kb-price-desc">本格ブランディングを目指す企業に<br/>ブランド・トータル視覚戦略</div>
                        <ul className="kb-price-features">
                            <li>全ビジュアル設計・制作</li>
                            <li>ブランドガイドライン策定</li>
                            <li>SNS運用ビジュアル30点〜</li>
                            <li>月次レビュー・継続プラン</li>
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
                        <dt>代表者</dt><dd>まぬちゃん（ビジュアルデザイナー）</dd>
                        <dt>事業内容</dt><dd>イラスト制作・漫画制作・図解デザイン・ブランディング支援</dd>
                        <dt>設立</dt><dd>令和4年10月14日</dd>
                        <dt>対応地域</dt><dd>全国（オンライン完結）</dd>
                    </dl>
                </div>
                <div className="kb-news-ad-box">
                    <div className="kb-news-ad-banner">
                        <span className="kb-news-ad-line1">AIのスピード × 人間の情緒</span>
                        <span className="kb-news-ad-line2">次世代のクリエイティブ・パートナー</span>
                    </div>
                </div>
                <div className="kb-news-contact-box">
                    <h3 className="kb-news-contact-header">あなたのビジネスの「視覚化」を、<br />今すぐ始めませんか？</h3>
                    <p className="kb-news-contact-list">
                        ・「何をしているか」が顧客に伝わらない<br />
                        ・広告やSNSの成約率が改善しない<br />
                        ・プロフェッショナルなビジュアルの統一感が欲しい<br />
                        ・デザイナーに頼むほどではないが質は保ちたい
                    </p>
                    <a href="/intake" className="kb-news-contact-btn">視覚化診断を受ける（無料） ☞</a>
                </div>
            </footer>
        </div>
    );
}
