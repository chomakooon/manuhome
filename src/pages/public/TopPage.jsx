import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TopPage.css';
import pixelDove from '../../assets/pixel_art_dove.png';
import Icon from '../../components/common/Icon';

export default function TopPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="katachi-ben-page">
            <div className="manga-magazine-wrapper">
                <div className="manga-magazine-cover">
                    
                    {/* --- HEADER TITLE --- */}
                    <div className="mag-header">
                        <div className="mag-title-group">
                            <span className="mag-title-sub">カタチ便</span>
                            <h1 className="mag-title-main">カタチ便</h1>
                        </div>
                        <div className="mag-brand">青ドット舎</div>
                        <div className="mag-issue-info">特大号 / 2026 SPRING</div>
                    </div>

                    {/* --- CENTER VISUAL --- */}
                    <div className="mag-center-visual">
                        <img src={pixelDove} alt="カタチ便 ピクセル鳩" className="mag-dove-img" />
                    </div>

                    {/* --- HEADLINE NAVIGATION --- */}
                    <div className="mag-headlines">
                        
                        {/* 巻頭特集: サービス紹介 */}
                        <Link to="/services" className="mag-link-card mag-hl-1">
                            <div className="mag-badge">巻頭特集</div>
                            <h2 className="mag-hl-title">サービス紹介</h2>
                        </Link>

                        {/* 特集: 制作事例 */}
                        <Link to="/portfolio" className="mag-link-card mag-hl-2">
                            <div className="mag-badge">特集</div>
                            <h2 className="mag-hl-title">制作事例</h2>
                        </Link>

                        {/* 巻末企画: 制作の流れ */}
                        <Link to="/services#workflow" className="mag-link-card mag-hl-3">
                            <div className="mag-badge">巻末企画</div>
                            <h2 className="mag-hl-title">制作の流れ</h2>
                        </Link>

                        {/* 作者紹介: イラストレーター */}
                        <Link to="/about" className="mag-link-card mag-hl-4">
                            <div className="mag-badge">作者紹介</div>
                            <h2 className="mag-hl-title">イラストレーター</h2>
                        </Link>

                        {/* お問い合わせ CTA */}
                        <div className="mag-contact-wrapper">
                            <Link to="/intake" className="mag-contact-btn">
                                視覚化診断を受ける <span className="mag-arrow">▶︎</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BUSINESS SECTION 1: PROBLEM (共感) --- */}
            <section className="business-section bs-light">
                <div className="bs-header">
                    <h2 className="bs-title">「伝わらない」ことが、最大の機会損失です。</h2>
                    <p className="bs-subtitle">
                        優れたサービスも、一瞬で理解されなければ存在しないのと同じです。
                    </p>
                </div>
                <div className="bs-grid bs-problem-grid">
                    <div className="bs-problem-item">
                        <Icon name="AlertCircle" color="var(--kb-news-magenta)" size={32} style={{marginBottom: '10px'}} />
                        <p>サービス内容が複雑で、商談やWebサイトで「結局何？」と思われている</p>
                    </div>
                    <div className="bs-problem-item">
                        <Icon name="Share2" color="var(--kb-news-magenta)" size={32} style={{marginBottom: '10px'}} />
                        <p>商品は良いはずなのに、広告やSNSで0.1秒の「スルーの壁」を越えられない</p>
                    </div>
                    <div className="bs-problem-item">
                        <Icon name="User" color="var(--kb-news-magenta)" size={32} style={{marginBottom: '10px'}} />
                        <p>ありふれた素材画像ばかりで、並ぶ競合の中で「選ぶ理由」を提供できていない</p>
                    </div>
                    <div className="bs-problem-item">
                        <Icon name="HelpCircle" color="var(--kb-news-magenta)" size={32} style={{marginBottom: '10px'}} />
                        <p>想いやビジョンが抽象的すぎて、ターゲットが自分の事として捉えられない</p>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 2: SOLUTION (解決) --- */}
            <section className="business-section bs-white">
                <div className="bs-header">
                    <h2 className="bs-title">「伝わらない」を、ビジュアルで「選ばれる」へ。</h2>
                    <p className="bs-subtitle">
                        カタチ便は、抽象的なビジネス概念を、顧客が「即断できる」視覚情報へと変換します。
                        独自のビジュアルコンサルティングにより、イラスト、漫画、AI生成を最適に組み合わせ、
                        ターゲットの行動を促す「伝わるデザイン」を設計します。
                    </p>
                </div>
            </section>

            {/* --- BUSINESS SECTION 3: SERVICES (導線) --- */}
            <section className="business-section bs-light">
                <div className="bs-header">
                    <h2 className="bs-title">収益を加速させる視覚ソリューション</h2>
                </div>
                <div className="bs-grid">
                    <div className="bs-card">
                        <div className="bs-icon">
                            <Icon name="Palette" color="var(--kb-news-magenta)" size={48} />
                        </div>
                        <h3>戦略的イラスト制作</h3>
                        <p>単なる絵ではなく、ブランドの世界観を瞬時に共有し、顧客の信頼を勝ち取る「視覚資産」を構築します。</p>
                        <Link to="/services" className="bs-card-link">収益への繋げ方をみる ☞</Link>
                    </div>
                    <div className="bs-card">
                        <div className="bs-icon">
                            <Icon name="BookOpen" color="var(--kb-news-magenta)" size={48} />
                        </div>
                        <h3>成約型漫画制作</h3>
                        <p>難しい仕組みをストーリーで「自分事」化。疑問を払拭し、成約（CVR）を直接改善する広告漫画を脚本から設計。</p>
                        <Link to="/services" className="bs-card-link">収益への繋げ方をみる ☞</Link>
                    </div>
                    <div className="bs-card">
                        <div className="bs-icon">
                            <Icon name="BarChart" color="var(--kb-news-magenta)" size={48} />
                        </div>
                        <h3>ビジネス図解 / ブランディング</h3>
                        <p>抽象的な強みを「即断できる」形へ。一貫したビジュアル言語で、商談の成約率とブランド価値を最大化します。</p>
                        <Link to="/services" className="bs-card-link">収益への繋げ方をみる ☞</Link>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 4: STRENGTH (強み) --- */}
            <section className="business-section bs-white">
                <div className="bs-header">
                    <h2 className="bs-title">カタチ便の強み</h2>
                    <h3 className="bs-subtitle-strong">AIの実行力 × 人間の感性と言語化</h3>
                </div>
                <div className="bs-content-wide">
                    <p>
                        最新AIによる圧倒的な試作スピードと、プロのクリエイターによる情緒・文脈に合わせた細部調整を融合。
                        「速さ・質・戦略性」を同時に実現し、単なる制作物ではなく、ビジネスを加速させる武器を提供します。
                    </p>
                </div>
            </section>

            {/* --- BUSINESS SECTION 5: FLOW --- */}
            <section className="business-section bs-light" id="flow">
                <div className="bs-header">
                    <h2 className="bs-title">制作の流れ</h2>
                </div>
                <div className="bs-flow-grid">
                    <div className="flow-step">
                        <span className="step-num">01</span>
                        <h4>診断・ヒアリング</h4>
                        <p>現状の課題とターゲットを徹底的に整理します。</p>
                    </div>
                    <div className="flow-step">
                        <span className="step-num">02</span>
                        <h4>コンセプト提案</h4>
                        <p>漫画・イラスト・図解など、最適な手法を決定します。</p>
                    </div>
                    <div className="flow-step">
                        <span className="step-num">03</span>
                        <h4>制作・共創</h4>
                        <p>AIプロトタイプをベースに細部を追い込みます。</p>
                    </div>
                    <div className="flow-step">
                        <span className="step-num">04</span>
                        <h4>納品・効果検証</h4>
                        <p>納品後の活用アドバイスまでサポートします。</p>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 6: FAQ --- */}
            <section className="business-section bs-white">
                <div className="bs-header">
                    <h2 className="bs-title">よくある質問</h2>
                </div>
                <div className="bs-faq-list">
                    <div className="faq-item">
                        <h4>Q. 自分のサービスの強みがまだあやふやですが、相談しても大丈夫ですか？</h4>
                        <p>A. はい、もちろんです。代表との対話を通じて、あなたの想いや価値を整理し、言語化するところからお手伝いします。</p>
                    </div>
                    <div className="faq-item">
                        <h4>Q: 納期が短いのですが対応可能ですか？</h4>
                        <p>A: AI活用ワークフローにより、通常よりも早い初案提出が可能です。</p>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 7: CONTACT --- */}
            <section className="business-section bs-light" style={{textAlign: 'center', paddingBottom: '120px'}} id="contact">
                <div className="bs-header">
                    <h2 className="bs-title">あなたの「カタチ」を収益へ。</h2>
                    <p className="bs-subtitle">言葉で説明しきれない価値を、直感で選ばれる力に変えましょう。<br/>限定無料の視覚化診断、受付中。</p>
                </div>
                <Link to="/intake" className="mag-contact-btn" style={{position: 'static', transform: 'none', display: 'inline-flex'}}>
                    視覚化診断を受ける（無料） <span className="mag-arrow">▶︎</span>
                </Link>
            </section>

        </div>
    );
}
