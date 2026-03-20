import Card from '../../components/ui/Card';
import StepFlow from '../../components/order-flow/StepFlow';
import { Palette, Coffee, Shirt, Smartphone, Heart } from 'lucide-react';
import './PetPage.css';

export default function PetPage() {
    const examples = [
        { icon: <Palette size={24} strokeWidth={1.5} />, title: 'ペットイラスト', description: '大切な家族を温かいタッチで描きます' },
        { icon: <Coffee size={24} strokeWidth={1.5} />, title: 'マグカップ', description: 'お気に入りの写真をマグカップに' },
        { icon: <Shirt size={24} strokeWidth={1.5} />, title: 'Tシャツ', description: 'オリジナルデザインのウェアラブルグッズ' },
        { icon: <Smartphone size={24} strokeWidth={1.5} />, title: 'スマホケース', description: 'いつも一緒にいられるスマホケース' },
    ];

    const steps = [
        { title: 'お写真を送る', description: 'お気に入りの写真を数枚お送りください。表情や角度を確認します。' },
        { title: 'デザイン制作', description: 'ペットの特徴を活かしたイラストを制作。ラフ段階でご確認いただけます。' },
        { title: 'グッズ制作', description: 'ご希望のグッズ形態に合わせて仕上げ・発注します。' },
        { title: 'お届け', description: '世界にひとつだけのオリジナルグッズをお届けします。' },
    ];

    return (
        <div className="pet-page">
            {/* Hero */}
            <section className="pet-hero section">
                <div className="container">
                    <p className="pet-hero__badge">Pet Goods</p>
                    <h1 className="pet-hero__title">
                        大切な家族の想い出を、<br />
                        <span className="text-gradient-warm">世界にひとつだけの形に</span>
                    </h1>
                    <p className="section-subtitle">
                        あなたのペットをモチーフにした、心温まるオリジナルグッズを制作します
                    </p>
                </div>
            </section>

            {/* Emotional Appeal */}
            <section className="pet-emotion section">
                <div className="container">
                    <div className="pet-emotion__card">
                        <div className="pet-emotion__icon"><Heart size={40} strokeWidth={1} /></div>
                        <h2>いつまでも、この子と一緒に</h2>
                        <p>
                            日々の何気ない表情、甘えてくる仕草、元気に走り回る姿——<br />
                            大切なペットとの時間を、ずっと手元に残せるグッズにしませんか？<br />
                            写真とは違う、温かみのあるイラストで、かけがえのない想い出を形にします。
                        </p>
                    </div>
                </div>
            </section>

            {/* Examples */}
            <section className="pet-examples section">
                <div className="container">
                    <h2 className="section-title">制作例</h2>
                    <div className="pet-examples__grid">
                        {examples.map((ex, i) => (
                            <Card key={i} icon={ex.icon} title={ex.title} description={ex.description} variant="compact" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="pet-flow section">
                <div className="container">
                    <h2 className="section-title">制作の流れ</h2>
                    <p className="section-subtitle">お写真を送るだけ。あとはお任せください。</p>
                    <StepFlow steps={steps} />
                </div>
            </section>

            {/* Order CTA */}
            <section className="pet-cta section">
                <div className="container">
                    <div className="pet-cta__card">
                        <h2 className="pet-cta__title">今すぐ注文する</h2>
                        <p className="pet-cta__desc">
                            写真をアップロードし、スタイルを選んで、簡単にご注文いただけます。<br />
                            1匹 ¥15,000〜
                        </p>
                        <a href="/order" className="btn btn-primary btn-lg">
                            注文ページへ進む →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
