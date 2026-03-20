import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, FolderOpen, Mail } from 'lucide-react';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="success-page">
            <section className="success-hero section">
                <div className="container">
                    <div className="success-card">
                        <div className="success-card__icon">
                            <CheckCircle size={56} strokeWidth={1.2} />
                        </div>
                        <h1 className="success-card__title">ご注文ありがとうございます！</h1>
                        <p className="success-card__message">
                            お支払いが完了しました。プロジェクトが自動的に作成されました。<br />
                            ご登録のメールアドレスに確認メールをお送りしています。
                        </p>

                        {sessionId && (
                            <div className="success-card__ref">
                                <span>注文番号:</span>
                                <code>{sessionId.slice(0, 20)}...</code>
                            </div>
                        )}

                        <div className="success-actions">
                            <Link to="/projects" className="btn btn-primary btn-lg">
                                <FolderOpen size={18} />
                                プロジェクトを確認する
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="success-timeline">
                            <h3>今後の流れ</h3>
                            <div className="success-timeline__steps">
                                <div className="success-timeline__step success-timeline__step--done">
                                    <span className="success-timeline__dot" />
                                    <div>
                                        <strong>ご注文受付</strong>
                                        <p>お支払いが完了しました</p>
                                    </div>
                                </div>
                                <div className="success-timeline__step">
                                    <span className="success-timeline__dot" />
                                    <div>
                                        <strong>制作開始</strong>
                                        <p>クリエイターが制作を開始します</p>
                                    </div>
                                </div>
                                <div className="success-timeline__step">
                                    <span className="success-timeline__dot" />
                                    <div>
                                        <strong>確認・修正</strong>
                                        <p>完成イラストをプロジェクトルームでご確認</p>
                                    </div>
                                </div>
                                <div className="success-timeline__step">
                                    <span className="success-timeline__dot" />
                                    <div>
                                        <strong>納品</strong>
                                        <p>最終データをダウンロード</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
