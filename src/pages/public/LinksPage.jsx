import Card from '../../components/ui/Card';
import { Instagram, Twitter, NotebookText, MessageCircle, Mail } from 'lucide-react';
import './LinksPage.css';

export default function LinksPage() {
    const links = [
        { icon: <Instagram size={24} strokeWidth={1.5} />, title: 'Instagram', description: '制作過程や完成作品を日々発信中', href: '#', color: '#E4405F' },
        { icon: <Twitter size={24} strokeWidth={1.5} />, title: 'X (Twitter)', description: 'ビジネス寄りの発信やお知らせ', href: '#', color: '#1DA1F2' },
        { icon: <NotebookText size={24} strokeWidth={1.5} />, title: 'note', description: '制作の裏話やノウハウ記事', href: '#', color: '#41C9B4' },
        { icon: <MessageCircle size={24} strokeWidth={1.5} />, title: 'LINE', description: '1:1でのご相談はこちら', href: '#', color: '#00B900' },
        { icon: <Mail size={24} strokeWidth={1.5} />, title: 'Mail', description: 'info@example.com', href: 'mailto:info@example.com', color: '#6c5ce7' },
    ];

    return (
        <div className="links-page">
            <section className="links-hero section">
                <div className="container">
                    <p className="links-hero__badge">Links</p>
                    <h1 className="links-hero__title">SNS・連絡先</h1>
                    <p className="section-subtitle">
                        各プラットフォームでつながりましょう
                    </p>
                </div>
            </section>

            <section className="links-list section">
                <div className="container">
                    <div className="links-list__grid">
                        {links.map((link) => (
                            <Card
                                key={link.title}
                                icon={link.icon}
                                title={link.title}
                                description={link.description}
                                href={link.href}
                                variant="link"
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
