import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, RefreshCw, BarChart, Users, BookOpen, Send, CheckCircle } from 'lucide-react';
import Icon from '../../components/common/Icon';
import './DiagnosticPage.css';

const QUIZ_STEPS = [
  {
    id: 1,
    question: "現在の主な活動形態を教えてください",
    options: [
      { id: 'corporate', label: "企業・法人", icon: "Building" },
      { id: 'freelance', label: "個人事業主・フリーランス", icon: "Briefcase" },
      { id: 'creator', label: "個人クリエイター", icon: "Palette" }
    ]
  },
  {
    id: 2,
    question: "現在抱えている一番の課題は何ですか？",
    options: [
      { id: 'complex', label: "サービスや商品が複雑で説明しにくい", icon: "Puzzle" },
      { id: 'impression', label: "SNSや名刺で印象に残らない", icon: "User" },
      { id: 'boring', label: "資料やLPの離脱率が高い・読まれない", icon: "Frown" },
    ]
  },
  {
    id: 3,
    question: "主に誰に情報を届けたいですか？",
    options: [
      { id: 'btob', label: "法人ビジネスマン (BtoB)", icon: "UserCheck" },
      { id: 'btoc', label: "一般消費者 (BtoC)", icon: "ShoppingBag" },
      { id: 'recruit', label: "採用候補者・求職者", icon: "Handshake" }
    ]
  }
];

export default function DiagnosticPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleOptionSelect = (stepId, optionId) => {
    setAnswers(prev => ({ ...prev, [stepId]: optionId }));
    
    if (currentStep < QUIZ_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      analyzeResults({ ...answers, [stepId]: optionId });
    }
  };

  const analyzeResults = (finalAnswers) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Diagnostic Logic
      const q2 = finalAnswers[2];
      let recommendation = {};

      if (q2 === 'complex') {
        recommendation = {
          title: "図解イラスト",
          categoryUrl: "diagram",
          desc: "専門用語や複雑な仕組みも、パッと見で直感的に伝わる「図解」が最適です。",
          before: "文字がびっしり詰まったサービス説明文。顧客は「読むのが面倒」と離脱してしまう状態。",
          after: "情報を構造化した1枚の図解。顧客は直感的に全体像を理解し、検討フェーズへ即座に進みます。",
          merit: "伝達スピードの向上・離脱率の低下"
        };
      } else if (q2 === 'impression') {
        recommendation = {
          title: "SNSアイコン・キャラクター",
          categoryUrl: "icon",
          desc: "あなたのコンセプトを視覚化し、一度見たら忘れない「キャラクター・アイコン」が最適です。",
          before: "風景や適当な写真のアイコン。親近感が湧かず、多数のアカウントに埋もれて認知されない状態。",
          after: "人柄やコンセプトが伝わるオリジナルキャラクター。一目で認知され、指名検索やエンゲージメントが増加します。",
          merit: "単純接触効果の向上・ブランド認知の定着"
        };
      } else {
        recommendation = {
          title: "ビジネス4コマ漫画",
          categoryUrl: "comic",
          desc: "途中で飽きられがちな情報も、起承転結のストーリーで強制的に読ませる「4コマ漫画」が最適です。",
          before: "共感を生むための長いストーリーテリング文章。途中で飽きられ、スクロールされてしまう状態。",
          after: "テンポよく読める4コマ漫画。ユーモアを交えつつ「課題→解決」を最後まで読ませ、コンバージョンに繋げます。",
          merit: "滞在時間の延長・共感とコンバージョンの獲得"
        };
      }
      
      setResult(recommendation);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  // SEO Content Data
  const seoArticles = [
    { title: "BtoBにおける図解の活用方法", icon: <BarChart size={24} /> },
    { title: "読まれるLPを作るキャラクター戦略", icon: <Users size={24} /> },
    { title: "採用活動を有利に進める漫画の力", icon: <BookOpen size={24} /> },
  ];

  return (
    <div className="diagnostic-page">
      {/* Hero Section */}
      <section className="diagnostic-hero">
        <div className="container">
          <span className="diagnostic-hero__tag">無料ビジュアル診断</span>
          <h1 className="diagnostic-hero__title">
            あなたのビジネス、<br />
            <span className="text-highlight">図解</span> にするとどうなる？
          </h1>
          <p className="diagnostic-hero__desc">
            たった3問の質問に答えるだけで、あなたの課題を解決する「最適なビジュアル表現」をご提案します。
          </p>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="diagnostic-quiz-section container">
        {!result && !isAnalyzing && (
          <div className="diagnostic-quiz-card">
            <div className="diagnostic-quiz-progress">
              Step {currentStep + 1} / {QUIZ_STEPS.length}
            </div>
            <h2 className="diagnostic-quiz-question">{QUIZ_STEPS[currentStep].question}</h2>
            <div className="diagnostic-quiz-options">
              {QUIZ_STEPS[currentStep].options.map(opt => (
                <button 
                  key={opt.id} 
                  className={`diagnostic-quiz-btn ${answers[QUIZ_STEPS[currentStep].id] === opt.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(QUIZ_STEPS[currentStep].id, opt.id)}
                >
                  <span className="diagnostic-quiz-icon">
                    <Icon name={opt.icon} color="var(--color-accent)" size={32} />
                  </span>
                  <span className="diagnostic-quiz-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="diagnostic-analyzing">
            <RefreshCw className="spinner" size={48} />
            <p>あなたのビジネスを分析中...</p>
          </div>
        )}

        {result && (
          <div className="diagnostic-result-container fade-in">
            <div className="diagnostic-result-header">
              <span className="diagnostic-result-badge">診断結果</span>
              <h2>あなたに最適なアプローチは...</h2>
              <div className="diagnostic-result-title">『{result.title}』</div>
              <p className="diagnostic-result-desc">{result.desc}</p>
            </div>

            <div className="diagnostic-ba-grid">
              <div className="diagnostic-ba-card before">
                <div className="ba-label">Before</div>
                <p>{result.before}</p>
              </div>
              <div className="diagnostic-ba-arrow"><ChevronRight size={32} /></div>
              <div className="diagnostic-ba-card after">
                <div className="ba-label">After</div>
                <p><strong>{result.after}</strong></p>
                <div className="ba-merit-badge">得られる効果: {result.merit}</div>
              </div>
            </div>

            <div className="diagnostic-cta-box">
              <h3>まずは無料でご相談ください</h3>
              <p>あなたのイメージをカタチにします。ヒアリングやラフ制作からスタート可能です。</p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/order?category=${result.categoryUrl}`)}
              >
                【{result.title}】のお見積り・相談へ進む
              </button>
              <button className="btn btn-text" onClick={handleReset}>
                <RefreshCw size={16} /> 診断をやり直す
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Leads / Portfolio / SEO Sections (Visible after or independent) */}
      <section className="diagnostic-b2b-section bg-light">
        <div className="container">
          <div className="b2b-content">
            <h2 className="section-title">なぜ「ビジュアル化」が必要なのか？</h2>
            <p className="section-desc">企業や事業主が直面するコミュニケーションの壁を、クリエイティブの力で突破します。</p>
            
            <div className="b2b-grid">
              <div className="b2b-card">
                <div className="b2b-icon">
                  <Icon name="Rocket" color="var(--color-accent)" size={40} />
                </div>
                <h3>6万倍の伝達スピード</h3>
                <p>人間の脳は、テキスト情報の6万倍の速さで画像情報を処理します。複雑な説明を一瞬で直感的に伝えます。</p>
              </div>
              <div className="b2b-card">
                <div className="b2b-icon">
                  <Icon name="Zap" color="var(--color-accent)" size={40} />
                </div>
                <h3>属人化の排除</h3>
                <p>トップ営業マンの口頭説明に依存せず、図解や漫画等のツールが常に100点の均一な説明を代行します。</p>
              </div>
              <div className="b2b-card">
                <div className="b2b-icon">
                  <Icon name="Brain" color="var(--color-accent)" size={40} />
                </div>
                <h3>高い記憶定着率</h3>
                <p>聞いた情報(10%)に比べ、視覚的な情報(65%)は数日経っても記憶に強く定着し、比較検討時に有利に働きます。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="diagnostic-seo-section container">
        <h2 className="section-title">ビジュアル戦略コラム</h2>
        <div className="seo-grid">
          {seoArticles.map((article, i) => (
            <div key={i} className="seo-card">
              <div className="seo-card-icon">{article.icon}</div>
              <h4>{article.title}</h4>
              <span className="seo-link">読む <ChevronRight size={14}/></span>
            </div>
          ))}
        </div>
      </section>

      <section className="diagnostic-lead-section bg-dark text-white">
        <div className="container lead-container">
          <div className="lead-text">
            <h2>診断結果と詳しい資料を<br/>PDFで受け取る</h2>
            <p>カタチ便のサービス詳細や料金表がまとまったPDF資料と、診断結果の詳細解説をメールでお送りします。</p>
          </div>
          <div className="lead-form">
            <div className="input-group">
              <input type="email" placeholder="メールアドレスを入力" className="form-input" />
              <button className="btn btn-primary"><Send size={18} /> 送信する</button>
            </div>
            <p className="lead-note"><CheckCircle size={14}/> 営業電話は一切いたしません</p>
          </div>
        </div>
      </section>
    </div>
  );
}
