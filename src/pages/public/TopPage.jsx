import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TopPage.css';
import pixelDove from '../../assets/pixel_art_dove.png';
import orderFlowManga from '../../assets/order_flow_manga.png';
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
                            <span className="mag-title-sub">ビジュアルコミュニケーション・スタジオ</span>
                            <h1 className="mag-title-main">カタチ便</h1>
                            <p className="mag-title-catch">想いを、伝わるカタチに。</p>
                        </div>
                        <div className="mag-brand">青ドット舎</div>
                        <div className="mag-issue-info">特大号 / 2026 SPRING</div>
                    </div>

                    {/* --- CENTER VISUAL --- */}
                    <div className="mag-center-visual">
                        <img src={pixelDove} alt="カタチ便 — イラスト制作・図解デザイン・漫画制作のビジュアルスタジオ" className="mag-dove-img" />
                        <p className="mag-center-desc">イラスト制作 ・ 漫画制作 ・ 図解デザイン ・ ブランディング</p>
                    </div>

                    {/* --- HEADLINE NAVIGATION --- */}
                    <div className="mag-headlines">
                        
                        {/* 巻頭特集: サービス紹介 */}
                        <Link to="/services" className="mag-link-card mag-hl-1">
                            <div className="mag-badge">巻頭特集</div>
                            <h2 className="mag-hl-title">サービス紹介</h2>
                            <p className="mag-hl-desc">イラスト・漫画・図解で、ビジネスの「伝わらない」を解決します。</p>
                        </Link>

                        {/* 特集: 制作事例 */}
                        <Link to="/portfolio" className="mag-link-card mag-hl-2">
                            <div className="mag-badge">特集</div>
                            <h2 className="mag-hl-title">制作事例</h2>
                            <p className="mag-hl-desc">過去の制作実績をカテゴリー別にご紹介。あなたの理想のテイストが見つかります。</p>
                        </Link>

                        {/* 巻末企画: 制作の流れ */}
                        <Link to="/services#workflow" className="mag-link-card mag-hl-3">
                            <div className="mag-badge">巻末企画</div>
                            <h2 className="mag-hl-title">制作の流れ</h2>
                            <p className="mag-hl-desc">ご相談から納品まで、4ステップで完結。初めての方でも安心のフロー。</p>
                        </Link>

                        {/* 作者紹介: クリエイター */}
                        <Link to="/about" className="mag-link-card mag-hl-4">
                            <div className="mag-badge">作者紹介</div>
                            <h2 className="mag-hl-title">クリエイター紹介</h2>
                            <p className="mag-hl-desc">カタチ便を運営するビジュアルデザイナー・まぬちゃんのプロフィール。</p>
                        </Link>

                        {/* お問い合わせ CTA */}
                        <div className="mag-contact-wrapper">
                            <Link to="/intake" className="mag-contact-btn">
                                <span className="mag-btn-glow"></span>
                                視覚化診断を受ける <span className="mag-arrow">▶︎</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BUSINESS SECTION 1: PROBLEM (共感) --- */}
            <section className="business-section bs-light" aria-label="課題提起">
                <div className="bs-header">
                    <h2 className="bs-title">「伝わらない」ことが、最大の機会損失です。</h2>
                    <p className="bs-subtitle">
                        どんなに優れた商品やサービスも、ターゲットに「0.1秒」で伝わらなければ、存在しないのと同じです。
                    </p>
                </div>
                <div className="bs-grid bs-problem-grid">
                    <div className="bs-problem-item">
                        <Icon name="AlertCircle" color="var(--color-accent)" size={32} style={{marginBottom: '10px'}} />
                        <h3>サービスの価値が伝わらない</h3>
                        <p>ビジネスモデルが複雑で、商談やWebサイトで「結局何をしてくれるの？」と思われてしまう。</p>
                    </div>
                    <div className="bs-problem-item">
                        <Icon name="Share2" color="var(--color-accent)" size={32} style={{marginBottom: '10px'}} />
                        <h3>SNSの「スルーの壁」を越えられない</h3>
                        <p>商品は良いはずなのに、広告やSNS投稿で目が止まらない。スクロールされるだけの毎日。</p>
                    </div>
                    <div className="bs-problem-item">
                        <Icon name="User" color="var(--color-accent)" size={32} style={{marginBottom: '10px'}} />
                        <h3>競合と差別化できない</h3>
                        <p>ありふれた素材画像ばかりで、並ぶ競合の中で「あなたを選ぶ理由」を提示できていない。</p>
                    </div>
                    <div className="bs-problem-item">
                        <Icon name="HelpCircle" color="var(--color-accent)" size={32} style={{marginBottom: '10px'}} />
                        <h3>ビジョンが伝わらない</h3>
                        <p>想いやビジョンが抽象的すぎて、見込み客が自分ごととして捉えられず行動に繋がらない。</p>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 2: SOLUTION (解決) --- */}
            <section className="business-section bs-white" aria-label="解決策">
                <div className="bs-header">
                    <h2 className="bs-title">「伝わらない」を、ビジュアルで「選ばれる」へ。</h2>
                    <p className="bs-subtitle">
                        カタチ便は、抽象的なビジネス概念を、ターゲットが「即断できる」視覚情報へ変換する
                        ビジュアルコミュニケーション・スタジオです。
                        独自のヒアリングとAI活用ワークフローにより、イラスト・漫画・図解を最適に組み合わせ、
                        顧客の行動を促す「伝わるデザイン」を設計します。
                    </p>
                </div>
            </section>

            {/* --- BUSINESS SECTION 3: SERVICES (導線) --- */}
            <section className="business-section bs-light" aria-label="サービス一覧">
                <div className="bs-header">
                    <h2 className="bs-title">収益を加速させる3つのビジュアルソリューション</h2>
                </div>
                <div className="bs-grid">
                    <div className="bs-card">
                        <div className="bs-icon">
                            <Icon name="Palette" color="var(--color-accent)" size={48} />
                        </div>
                        <h3>戦略的イラスト制作</h3>
                        <p>SNSアイコン、Webサイト素材、商品パッケージまで。ブランドの世界観を瞬時に伝え、顧客の信頼を勝ち取る「視覚資産」を構築します。</p>
                        <Link to="/services" className="bs-card-link">サービス詳細を見る ☞</Link>
                    </div>
                    <div className="bs-card">
                        <div className="bs-icon">
                            <Icon name="BookOpen" color="var(--color-accent)" size={48} />
                        </div>
                        <h3>成約を生む漫画制作</h3>
                        <p>複雑なサービスを共感ストーリーに変換。顧客の「これ、私のことだ」を引き出し、成約率（CVR）を直接改善する広告漫画を脚本から設計。</p>
                        <Link to="/services" className="bs-card-link">サービス詳細を見る ☞</Link>
                    </div>
                    <div className="bs-card">
                        <div className="bs-icon">
                            <Icon name="BarChart" color="var(--color-accent)" size={48} />
                        </div>
                        <h3>ビジネス図解・ブランディング</h3>
                        <p>抽象的なビジネスの強みを「一目で理解できる」図解へ。一貫したビジュアル言語で、商談の成約率とブランド価値を最大化します。</p>
                        <Link to="/services" className="bs-card-link">サービス詳細を見る ☞</Link>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 4: STRENGTH (強み) --- */}
            <section className="business-section bs-white" aria-label="カタチ便の強み">
                <div className="bs-header">
                    <h2 className="bs-title">カタチ便が選ばれる理由</h2>
                    <h3 className="bs-subtitle-strong">AIの実行力 × 人間の感性と言語化力</h3>
                </div>
                <div className="bs-content-wide">
                    <p>
                        最新AIによる圧倒的な試作スピードと、プロのクリエイターによる情緒・文脈に合わせた繊細な調整を融合。
                        「速さ・品質・戦略性」を同時に実現し、単なる制作物ではなく、ビジネスを加速させる武器をお届けします。
                    </p>
                </div>
            </section>

            {/* --- BUSINESS SECTION 5: MANGA FLOW --- */}
            <section className="business-section bs-light bs-manga-section" id="flow" aria-label="制作の流れ">
                <div className="bs-header">
                    <h2 className="bs-title">制作の流れ ― ご相談から納品まで4ステップ</h2>
                    <p className="bs-subtitle">
                        初めての方でも安心。ヒアリングからお納めまで、丁寧にサポートします。
                    </p>
                </div>
                <div className="bs-manga-flow-wrapper">
                    <img src={orderFlowManga} alt="カタチ便の注文フロー：悩み相談→依頼→デザイン制作→完成納品の4ステップ" className="bs-manga-img" />
                </div>
                <div className="bs-flow-grid">
                    <div className="flow-step">
                        <span className="step-num">01</span>
                        <h4>無料ヒアリング・診断</h4>
                        <p>現状の課題やターゲット層を整理し、最適なビジュアル戦略をご提案します。</p>
                    </div>
                    <div className="flow-step">
                        <span className="step-num">02</span>
                        <h4>コンセプト設計・お見積もり</h4>
                        <p>漫画・イラスト・図解など、最適な表現手法と制作スケジュールをご提示します。</p>
                    </div>
                    <div className="flow-step">
                        <span className="step-num">03</span>
                        <h4>制作・フィードバック</h4>
                        <p>AI試作をベースにお客様と一緒に品質を磨き上げます。修正回数の制限はありません。</p>
                    </div>
                    <div className="flow-step">
                        <span className="step-num">04</span>
                        <h4>納品・活用サポート</h4>
                        <p>各種フォーマットで納品。SNS運用や印刷入稿の活用アドバイスまでサポートします。</p>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 6: FAQ --- */}
            <section className="business-section bs-white" aria-label="よくある質問">
                <div className="bs-header">
                    <h2 className="bs-title">よくある質問</h2>
                </div>
                <div className="bs-faq-list">
                    <div className="faq-item">
                        <h4>Q. まだサービスの強みが明確ではありませんが、相談できますか？</h4>
                        <p>A. はい、もちろんです。代表との対話を通じて、あなたの想いや価値を整理し、言語化するところからお手伝いします。「何をお願いしたいかわからない」という段階でも大歓迎です。</p>
                    </div>
                    <div className="faq-item">
                        <h4>Q. 納期が短いのですが対応可能ですか？</h4>
                        <p>A. AI活用ワークフローにより、通常よりも早い初案提出が可能です。最短3営業日での初案提出実績があります。お急ぎの場合もまずはご相談ください。</p>
                    </div>
                    <div className="faq-item">
                        <h4>Q. イラストのテイストや方向性はどうやって決めますか？</h4>
                        <p>A. ヒアリング時に参考イメージや競合資料をお伺いし、複数のテイスト案をご提案します。AIによるプロトタイプで方向性を確認後、本制作に入るため、ミスマッチのリスクを最小限に抑えられます。</p>
                    </div>
                    <div className="faq-item">
                        <h4>Q. 予算が限られていますが、対応してもらえますか？</h4>
                        <p>A. ¥50,000〜のライトプランからご用意しています。ご予算に応じた最適なプランをご提案しますので、まずは無料の視覚化診断にてご相談ください。</p>
                    </div>
                </div>
            </section>

            {/* --- BUSINESS SECTION 7: CONTACT --- */}
            <section className="business-section bs-light bs-cta-final" style={{textAlign: 'center', paddingBottom: '120px'}} id="contact" aria-label="お問い合わせ">
                <div className="bs-header">
                    <h2 className="bs-title">あなたの「想い」を、選ばれるカタチに。</h2>
                    <p className="bs-subtitle">言葉では説明しきれない価値を、0.1秒で直感的に伝えるビジュアルに変えましょう。<br/>限定無料の視覚化診断、受付中。</p>
                </div>
                <Link to="/intake" className="mag-contact-btn" style={{position: 'static', transform: 'none', display: 'inline-flex'}}>
                    <span className="mag-btn-glow"></span>
                    視覚化診断を受ける（無料） <span className="mag-arrow">▶︎</span>
                </Link>
            </section>

        </div>
    );
}
