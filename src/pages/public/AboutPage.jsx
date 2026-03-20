import React from 'react';
import { Target, Users, Zap, MessageCircle, Heart, Star, Check } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
    return (
        <div className="about-page-wrapper">
            
            {/* --- TOP SECTION: Creator Info --- */}
            <section className="creator-info-section">
                <div className="creator-info-container">
                    <h1 className="creator-info-title">クリエイター情報</h1>
                    
                    <div className="creator-info-card">
                        <div className="creator-info-photo">
                            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400" alt="カタチ便" />
                        </div>
                        <div className="creator-info-details">
                            <h2 className="creator-info-name">まぬちゃん / ビジュアルデザイン室</h2>
                            <p className="creator-info-message">「頭の中のイメージを、カタチにして届ける。」</p>
                            <div className="creator-info-bio">
                                <p>2022年設立。ビジュアルコミュニケーション特区にて、個人事業主や中小企業、クリエイターの「言葉にできない想い」を可視化するサービスを展開。</p>
                                <p>複雑なビジネスモデルも図解でシンプルに構築。イラスト、図解、UIデザインまで、ビジネスの課題解決に直結するビジュアルを提供します。</p>
                            </div>
                            <div className="creator-info-scroll-hint">
                                <span className="scroll-text">Scroll for more profile</span>
                                <div className="scroll-line"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BOTTOM SECTION: Profile Book --- */}
            <div className="kb-profile-page">
            
            {/* The Binder Container */}
            <div className="kb-profile-binder">
                
                {/* Binder Rings / Holes (Visual) */}
                <div className="kb-binder-holes">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="kb-binder-hole"></div>
                    ))}
                </div>

                {/* Inner Content Area */}
                <div className="kb-profile-content">
                    
                    {/* --- HEADER --- */}
                    <div className="kb-profile-header">
                        <h1 className="kb-profile-title">MY PROFILE</h1>
                        <div className="kb-profile-date">
                            かいた日 <span className="kb-date-box">2026</span> 年 <span className="kb-date-box">3</span> がつ <span className="kb-date-box">17</span> にち
                        </div>
                    </div>

                    {/* --- BASIC INFO --- */}
                    <div className="kb-section-basic">
                        <div className="kb-info-row">
                            私のなまえは <span className="kb-input-line long">まぬちゃん</span> ！
                            って呼んでね！
                        </div>
                        <div className="kb-info-row">
                            <span className="kb-input-line short">3</span> 月生まれの <span className="kb-input-line medium">おひつじ座</span> で、
                            血液型は <span className="kb-input-line short">B</span> 型だよ！
                        </div>
                        <div className="kb-info-row">
                            性格は、みんなから <span className="kb-input-line long">明るくてがんばってる</span> って言われるんだけど、
                        </div>
                        <div className="kb-info-row center-row">
                            自分では <span className="kb-input-line long">ポンコツだ〜..</span> って思ってるよ...！
                        </div>
                    </div>

                    {/* --- MIDDLE SECTION: FAVORITES & YES/NO --- */}
                    <div className="kb-middle-grid">
                        
                        {/* Favorites Left Side */}
                        <div className="kb-favorites-area">
                            <div className="kb-area-title">
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                MY FAVORITES
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                <span className="kb-area-subtitle">わたしのお気に入り</span>
                            </div>

                            <div className="kb-bubbles-container">
                                {/* Row 1 */}
                                <div className="kb-bubble shape-1">
                                    <span className="kb-bubble-label">好きな色</span>
                                    <span className="kb-bubble-val text-xs">くすみホワイト</span>
                                </div>
                                <div className="kb-bubble shape-2">
                                    <span className="kb-bubble-label">季節</span>
                                    <span className="kb-bubble-val">春</span>
                                </div>
                                <div className="kb-bubble shape-3">
                                    <span className="kb-bubble-label">食べ物</span>
                                    <span className="kb-bubble-val text-xs">納豆ごはん</span>
                                </div>
                                
                                {/* Row 2 */}
                                <div className="kb-bubble shape-4">
                                    <span className="kb-bubble-label">音楽</span>
                                    <span className="kb-bubble-val">YOASOBI</span>
                                </div>
                                <div className="kb-bubble shape-5">
                                    <span className="kb-bubble-label">映画</span>
                                    <span className="kb-bubble-val text-xs">リメンバー・ミー</span>
                                </div>
                                <div className="kb-bubble shape-6">
                                    <span className="kb-bubble-label">アニメ・漫画</span>
                                    <span className="kb-bubble-val text-xs">銀魂 / からくりサーカス / ナンバMG５</span>
                                </div>

                                {/* Row 3 */}
                                <div className="kb-bubble shape-7">
                                    <span className="kb-bubble-label">YouTube</span>
                                    <span className="kb-bubble-val text-2xs leading-tight">ゆるコンピューターラジオ</span>
                                </div>
                                <div className="kb-bubble shape-8">
                                    <span className="kb-bubble-label">旅行先</span>
                                    <span className="kb-bubble-val">大阪</span>
                                </div>

                                {/* Row 4 */}
                                <div className="kb-bubble shape-9">
                                    <span className="kb-bubble-label">ブランド</span>
                                    <span className="kb-bubble-val">coach</span>
                                </div>
                                <div className="kb-bubble shape-10">
                                    <span className="kb-bubble-label">推し</span>
                                    <span className="kb-bubble-val text-2xs leading-tight">いないので推させてください！</span>
                                </div>
                            </div>
                        </div>

                        {/* WORK TALK Right Side (Adapted from Love Talk) */}
                        <div className="kb-work-talk-area">
                            <div className="kb-area-title">
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                WORK TALK
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                <span className="kb-area-subtitle">おしごとトーク</span>
                            </div>

                            <div className="kb-yesno-list">
                                <div className="kb-yesno-item">
                                    <span className="kb-yesno-q">徹夜で作業したことある？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn kb-yn-active">YES</span> <Heart size={10} fill="#00CFFF" color="#00CFFF"/> <span className="kb-yn">NO</span>
                                    </div>
                                </div>
                                <div className="kb-yesno-item">
                                    <span className="kb-yesno-q">作品を褒められて泣いたことある？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn kb-yn-active">YES</span> <Heart size={10} fill="#00CFFF" color="#00CFFF"/> <span className="kb-yn">NO</span>
                                    </div>
                                </div>
                                <div className="kb-yesno-item">
                                    <span className="kb-yesno-q">過去の作品を消したくなったことは？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn kb-yn-active">YES</span> <Heart size={10} fill="#00CFFF" color="#00CFFF"/> <span className="kb-yn">NO</span>
                                    </div>
                                </div>
                                <div className="kb-yesno-item">
                                    <span className="kb-yesno-q">今、絶対やりたい案件はある？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn kb-yn-active">YES</span> <Heart size={10} fill="#00CFFF" color="#00CFFF"/> <span className="kb-yn">NO</span>
                                    </div>
                                </div>
                            </div>

                            <div className="kb-work-mini-bubbles">
                                <div className="kb-mini-bubble">
                                    <span className="kb-mini-q">きゅんとする<br/>瞬間は？</span>
                                    <span className="kb-mini-a">ラフが<br/>一発OK<br/>だった時♡</span>
                                </div>
                                <div className="kb-mini-bubble">
                                    <span className="kb-mini-q">理想の<br/>クライアントは？</span>
                                    <span className="kb-mini-a">一緒に<br/>熱くなれる人</span>
                                </div>
                            </div>

                            <div className="kb-area-title small">
                                <Heart className="kb-icon-heart small" fill="currentColor" />
                                YES・NO
                                <Heart className="kb-icon-heart small" fill="currentColor" />
                                <span className="kb-area-subtitle">イエス・ノーコーナー</span>
                            </div>

                            <div className="kb-yesno-list">
                                <div className="kb-yesno-item border">
                                    <span className="kb-yesno-q">誰にも言えない秘密の技術がある？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn">YES</span> <Heart size={10} color="#00CFFF"/> <span className="kb-yn kb-yn-active">NO</span>
                                    </div>
                                </div>
                                <div className="kb-yesno-item border">
                                    <span className="kb-yesno-q">クリエイターとしてのモテ期はもうきた？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn">YES</span> <Heart size={10} color="#00CFFF"/> <span className="kb-yn kb-yn-active">NO</span>
                                    </div>
                                </div>
                                <div className="kb-yesno-item border">
                                    <span className="kb-yesno-q">20万以上の機材を買ったことある？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn kb-yn-active">YES</span> <Heart size={10} fill="#00CFFF" color="#00CFFF"/> <span className="kb-yn">NO</span>
                                    </div>
                                </div>
                                <div className="kb-yesno-item border">
                                    <span className="kb-yesno-q">ていうか、ふるさと納税してる？</span>
                                    <div className="kb-yesno-options">
                                        <span className="kb-yn">YES</span> <Heart size={10} color="#00CFFF"/> <span className="kb-yn kb-yn-active">NO</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* --- BOTTOM SECTION: SECRET & PSYCHO TEST --- */}
                    <div className="kb-bottom-section">
                        
                        <div className="kb-secret-q-area">
                            <div className="kb-area-title inline">
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                SECRET QUESTION
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                <span className="kb-area-subtitle inline">ひみつの質問</span>
                            </div>

                            <div className="kb-sq-list">
                                <div className="kb-sq-item">
                                    <span className="kb-sq-q">Q.1 よく気分転換に行く場所は？</span>
                                    <span className="kb-sq-a">アニソンカラオケバー</span>
                                </div>
                                <div className="kb-sq-item">
                                    <span className="kb-sq-q">Q.2 住みたい街は？</span>
                                    <span className="kb-sq-a">高円寺！</span>
                                </div>
                                <div className="kb-sq-item">
                                    <span className="kb-sq-q">Q.3 納期前といえば？</span>
                                    <span className="kb-sq-a wide text-2xs leading-tight">部屋の掃除して漫画を積み直し、ついでに読む</span>
                                </div>
                                <div className="kb-sq-item">
                                    <span className="kb-sq-q">Q.4 ファーストMacはいつ？</span>
                                    <span className="kb-sq-a wide">社会人１年目！</span>
                                </div>
                            </div>
                        </div>

                        <div className="kb-psycho-area">
                            <div className="kb-area-title left">
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                PSYCHOLOGY TEST
                                <Heart className="kb-icon-heart" fill="currentColor" />
                                <span className="kb-area-subtitle inline">心理テスト</span>
                            </div>

                             <div className="kb-psycho-content">
                                 <p className="kb-psycho-q">Q.自分を甘やかしたいときにする行動は？</p>
                                 <div className="kb-psycho-a-box">
                                     <span className="kb-psycho-answer text-xs">野菜たっぷりクリームシチューを作ってゆっくり晩酌！</span>
                                     <span className="kb-psycho-result-text">頑張っているパートナーにしてあげたいことと一緒だそうです♡</span>
                                 </div>
                                 <p className="kb-psycho-desc">
                                     あなたはどうでしたか？ <Star size={16} fill="#FFDD57" color="#FFDD57"/>
                                 </p>
                             </div>
                        </div>

                    </div>

                </div>
            </div>
            
            
            </div>
        </div>
    );
}
