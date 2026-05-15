import Card from '../../components/ui/Card';
import StepFlow from '../../components/order-flow/StepFlow';
import { Lightbulb, Users, PartyPopper, Timer } from 'lucide-react';
import './NetworkingPage.css';

export default function NetworkingPage() {
    const features = [
        { icon: <Lightbulb size={24} strokeWidth={1.5} />, title: 'ビジネスの新しいヒント', description: '異業種のクリエイター・経営者との対話から、思いがけないアイデアが生まれます' },
        { icon: <Users size={24} strokeWidth={1.5} />, title: 'リアルなつながり', description: 'SNSだけでは得られない、顔が見える信頼関係を築けます' },
        { icon: <PartyPopper size={24} strokeWidth={1.5} />, title: 'アットホームな雰囲気', description: '少人数制で初めての方も安心。名刺交換だけの堅い場ではありません' },
    ];

    const forBeginners = [
        '初参加の方には主催者が丁寧にご紹介します',
        '名刺がなくても大丈夫です',
        '途中参加・途中退出OK',
        'オンライン参加も可能な回があります',
    ];

    const steps = [
        { title: 'フォームから申込み', description: '参加希望の旨と、希望日をお知らせください。' },
        { title: '日程調整', description: '次回開催日をご案内。少人数制のため、お早めに。' },
        { title: '当日参加', description: 'リラックスした雰囲気で交流。軽食・ドリンク付き。' },
    ];

    return (
        <div className="networking-page">
            <section className="net-hero section">
                <div className="container">
                    <p className="net-hero__badge">Networking</p>
                    <h1 className="net-hero__title">
                        ひとりで頑張らない。<br />
                        <span className="text-gradient-green">仲間と一緒に、次のステージへ</span>
                    </h1>
                    <p className="section-subtitle">
                        クリエイター×経営者が集まる少人数制の交流会
                    </p>
                </div>
            </section>

            <section className="net-features section">
                <div className="container">
                    <h2 className="section-title">どんな場？</h2>
                    <div className="net-features__grid">
                        {features.map((f, i) => (
                            <Card key={i} icon={f.icon} title={f.title} description={f.description} variant="compact" />
                        ))}
                    </div>
                </div>
            </section>

            <section className="net-beginners section">
                <div className="container">
                    <h2 className="section-title">初めての方へ</h2>
                    <div className="net-beginners__card">
                        <ul className="net-beginners__list">
                            {forBeginners.map((item, i) => (
                                <li key={i}>
                                    <span className="net-beginners__check">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="net-timer section">
                <div className="container">
                    <h2 className="section-title">
                        <Timer className="icon-inline" size={28} /> ニーズマッチ専用タイマー
                    </h2>
                    <p className="section-subtitle">
                        交流会で活用できるオンライン専用タイマーです。進行管理にお役立てください。
                    </p>
                    <div className="net-timer__iframe-wrapper">
                        <iframe
                            src="https://koryukai-timer.vercel.app/"
                            title="ニーズマッチ専用タイマー"
                            className="net-timer__iframe"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="net-timer__action">
                        <a href="https://koryukai-timer.vercel.app/" target="_blank" rel="noopener noreferrer" className="button button--outline">
                            別ウィンドウで開く
                        </a>
                    </div>
                </div>
            </section>

            <section className="net-flow section">
                <div className="container">
                    <h2 className="section-title">参加の流れ</h2>
                    <StepFlow steps={steps} />
                </div>
            </section>
        </div>
    );
}
