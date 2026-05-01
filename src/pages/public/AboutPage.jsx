import React from 'react';
import { Target, Users, Zap, MessageCircle, Palette, Layout, BarChart3, Smartphone, ArrowRight, Briefcase, Calendar } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
    return (
        <div className="about-page-wrapper">
            
            {/* --- HERO: Creator Introduction --- */}
            <section className="creator-info-section" aria-label="クリエイター紹介">
                <div className="creator-info-container">
                    <h1 className="creator-info-title">ビジュアルデザイナー まぬちゃん ― カタチ便</h1>
                    
                    <div className="creator-info-card">
                        <div className="creator-info-photo">
                            <img 
                                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400" 
                                alt="カタチ便 ビジュアルデザイナー まぬちゃんのプロフィール写真" 
                            />
                        </div>
                        <div className="creator-info-details">
                            <h2 className="creator-info-name">まぬちゃん / ビジュアルデザイン室</h2>
                            <p className="creator-info-message">「頭の中のイメージを、カタチにして届ける。」</p>
                            <div className="creator-info-bio">
                                <p>
                                    イラスト制作・図解デザイン・UIデザインを専門とするビジュアルデザイナーです。
                                    個人事業主や中小企業、クリエイターの「言葉にできない想い」を、
                                    伝わるビジュアルに変換するサービスを提供しています。
                                </p>
                                <p>
                                    複雑なビジネスモデルも図解でシンプルに可視化。
                                    お客様の課題解決に直結するビジュアルコミュニケーションを実現します。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MISSION & VISION --- */}
            <section className="about-mission-section" aria-label="ミッション・ビジョン">
                <div className="about-section-inner">
                    <div className="news-heading-bar">MISSION</div>
                    <h2 className="section-title">デザインで「伝わらない」を解決する</h2>
                    <div className="about-mission-grid">
                        <div className="about-mission-card">
                            <div className="about-mission-icon">
                                <Target size={28} />
                            </div>
                            <h3>なぜこの仕事をするのか</h3>
                            <p>
                                優れた商品やサービスを持っていても、「伝え方」がわからないだけで
                                埋もれてしまうビジネスを数多く見てきました。
                                デザインの力で、その価値を正しく届けることが私の使命です。
                            </p>
                        </div>
                        <div className="about-mission-card">
                            <div className="about-mission-icon">
                                <Users size={28} />
                            </div>
                            <h3>誰のためのサービスか</h3>
                            <p>
                                個人事業主・フリーランス・中小企業・スタートアップなど、
                                「デザイナーを雇うほどではないけれど、プロの力が必要」という方に向けて、
                                手の届く価格で高品質なビジュアルを提供します。
                            </p>
                        </div>
                        <div className="about-mission-card">
                            <div className="about-mission-icon">
                                <Zap size={28} />
                            </div>
                            <h3>大切にしていること</h3>
                            <p>
                                ヒアリングを通じてお客様のビジョンを深く理解し、
                                「見た目の美しさ」だけでなく「ビジネス成果につながるデザイン」を
                                追求しています。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SKILLS & SERVICES --- */}
            <section className="about-skills-section" aria-label="対応領域・スキル">
                <div className="about-section-inner">
                    <div className="news-heading-bar">SKILLS</div>
                    <h2 className="section-title">対応領域</h2>
                    <p className="section-subtitle">
                        イラストから図解、UIまで。ビジュアルに関わるあらゆる課題に対応します。
                    </p>
                    <div className="about-skills-grid">
                        <article className="about-skill-card" aria-label="イラスト制作">
                            <div className="about-skill-icon"><Palette size={24} /></div>
                            <div className="about-skill-body">
                                <h3>イラスト制作</h3>
                                <p>SNSアイコン、Webサイト素材、商品パッケージ向けイラストなど。世界観に合わせたオリジナルイラストを制作します。</p>
                            </div>
                        </article>
                        <article className="about-skill-card" aria-label="図解・インフォグラフィック">
                            <div className="about-skill-icon"><BarChart3 size={24} /></div>
                            <div className="about-skill-body">
                                <h3>図解・インフォグラフィック</h3>
                                <p>複雑な情報やビジネスモデルを、一目で理解できる図解に落とし込みます。プレゼン資料やLP素材にも対応。</p>
                            </div>
                        </article>
                        <article className="about-skill-card" aria-label="UIデザイン">
                            <div className="about-skill-icon"><Smartphone size={24} /></div>
                            <div className="about-skill-body">
                                <h3>UIデザイン</h3>
                                <p>Webサイトやアプリの画面設計・UIデザイン。ユーザー体験を意識した直感的なインターフェースを設計します。</p>
                            </div>
                        </article>
                        <article className="about-skill-card" aria-label="SNS向けビジュアル">
                            <div className="about-skill-icon"><Layout size={24} /></div>
                            <div className="about-skill-body">
                                <h3>SNS向けビジュアル</h3>
                                <p>Instagram・X（Twitter）・Threads向けの投稿画像やバナーを制作。ブランドの世界観を統一したビジュアル運用を支援します。</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* --- CAREER TIMELINE --- */}
            <section className="about-timeline-section" aria-label="経歴・実績">
                <div className="about-section-inner">
                    <div className="news-heading-bar">CAREER</div>
                    <h2 className="section-title">経歴・実績</h2>
                    <dl className="about-timeline">
                        <div className="about-timeline-item">
                            <dt className="about-timeline-year">
                                <Calendar size={16} />
                                <span>2022</span>
                            </dt>
                            <dd className="about-timeline-desc">
                                <strong>「カタチ便」設立</strong>
                                <p>ビジュアルコミュニケーション専門の個人デザイン事務所として活動を開始。イラスト制作・図解デザインを軸にサービスを展開。</p>
                            </dd>
                        </div>
                        <div className="about-timeline-item">
                            <dt className="about-timeline-year">
                                <Calendar size={16} />
                                <span>2023</span>
                            </dt>
                            <dd className="about-timeline-desc">
                                <strong>UIデザイン領域へ拡大</strong>
                                <p>Webサイト・アプリのUI設計にも対応範囲を拡大。個人開発者やスタートアップとの協業実績を積む。</p>
                            </dd>
                        </div>
                        <div className="about-timeline-item">
                            <dt className="about-timeline-year">
                                <Calendar size={16} />
                                <span>2024–</span>
                            </dt>
                            <dd className="about-timeline-desc">
                                <strong>SNSビジュアル運用支援を開始</strong>
                                <p>ブランドの世界観を統一したSNS投稿画像・バナー制作サービスを追加。クリエイターや事業者向けにビジュアル戦略のトータルサポートを提供中。</p>
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="about-cta-section" aria-label="お問い合わせ">
                <div className="about-section-inner">
                    <div className="about-cta-card">
                        <MessageCircle size={32} className="about-cta-icon" />
                        <h2>お仕事のご相談はお気軽にどうぞ</h2>
                        <p>
                            「こんなイメージを形にしたい」「まだ漠然としているけど相談したい」
                            ――そんな段階でも大歓迎です。まずはお気軽にお問い合わせください。
                        </p>
                        <div className="about-cta-buttons">
                            <a href="/order" className="btn btn-primary btn-lg about-cta-btn">
                                ご依頼・ご相談はこちら
                                <ArrowRight size={18} />
                            </a>
                            <a href="/portfolio" className="btn btn-outline btn-lg about-cta-btn">
                                ポートフォリオを見る
                                <Briefcase size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
