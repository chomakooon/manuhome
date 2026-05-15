import Card from '../../components/ui/Card';
import { MessageCircle, Calendar, Palette } from 'lucide-react';
import './ThanksPage.css';

export default function ThanksPage() {
    const nextActions = [
        { icon: <MessageCircle size={24} strokeWidth={1.5} />, title: 'LINE登録', description: '1:1でリアルタイム相談', href: '#' },
        { icon: <Calendar size={24} strokeWidth={1.5} />, title: '日程調整', description: 'オンライン面談を予約', href: '#' },
        { icon: <Palette size={24} strokeWidth={1.5} />, title: '作品を見る', description: '制作実績をチェック', to: '/services' },
    ];

    return (
        <div className="thanks-page">
            <section className="thanks-hero section">
                <div className="container">
                    <div className="thanks-hero__card">
                        <div className="thanks-hero__check">✓</div>
                        <h1 className="thanks-hero__title">送信完了しました</h1>
                        <p className="thanks-hero__message">
                            お問い合わせありがとうございます。<br />
                            24時間以内にご連絡いたします。
                        </p>
                    </div>
                </div>
            </section>

            <section className="thanks-next section">
                <div className="container">
                    <h2 className="section-title">次のアクション</h2>
                    <p className="section-subtitle">お待ちの間に、こちらもご覧ください</p>
                    <div className="thanks-next__grid">
                        {nextActions.map((action, i) => (
                            <Card
                                key={i}
                                icon={action.icon}
                                title={action.title}
                                description={action.description}
                                to={action.to}
                                href={action.href}
                                variant="compact"
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
