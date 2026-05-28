import Card from '../../components/ui/Card';
import { Instagram, Twitter, NotebookText, MessageCircle, Mail } from 'lucide-react';
import Breadcrumb from '../../sites/kataribin/components/Breadcrumb';
import PageSeo from '../../components/PageSeo';
import { SNS_LINKS } from '../../config/social.config';
import './LinksPage.css';

const BREADCRUMB = [
    { label: 'ホーム', to: '/' },
    { label: 'SNS・リンク', to: null },
];

// TODO: note / LINE 等の実 URL を取得後、ここを更新する
const LINKS = [
    {
        icon: <Instagram size={24} strokeWidth={1.5} />,
        title: 'Instagram',
        description: '制作過程や完成作品を日々発信中',
        href: SNS_LINKS.instagram,
        color: '#E4405F',
    },
    {
        icon: <Twitter size={24} strokeWidth={1.5} />,
        title: 'X (Twitter)',
        description: 'ビジネス寄りの発信やお知らせ',
        href: SNS_LINKS.x,
        color: '#000000',
    },
    {
        icon: <NotebookText size={24} strokeWidth={1.5} />,
        title: 'note',
        description: '制作の裏話やノウハウ記事',
        // TODO: 実 note URL を設定
        href: null,
        color: '#41C9B4',
    },
    {
        icon: <MessageCircle size={24} strokeWidth={1.5} />,
        title: 'LINE',
        description: '1:1でのご相談はこちら',
        // TODO: 実 LINE 公式アカウント URL を設定
        href: null,
        color: '#00B900',
    },
    {
        icon: <Mail size={24} strokeWidth={1.5} />,
        title: 'Mail',
        description: 'お問い合わせフォームからご連絡ください',
        href: '/contact',
        color: '#6c5ce7',
    },
];

export default function LinksPage() {
    // href が未設定（null）のリンクは非表示
    const visibleLinks = LINKS.filter((l) => l.href);

    return (
        <div className="links-page">
            <PageSeo pageKey="links" />
            <Breadcrumb items={BREADCRUMB} />
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
                        {visibleLinks.map((link) => (
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
