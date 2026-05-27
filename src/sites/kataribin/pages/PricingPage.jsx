/**
 * @file src/sites/kataribin/pages/PricingPage.jsx
 *
 * /pricing 独立ページ。料金プランの全カタログ表示。
 * データソース: src/config/pricing.config.js
 */

import { Link } from 'react-router-dom';
import { PawPrint, IdCard, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import {
    pricingCategories,
    pricingPlans,
    pricingNotes,
    pricingFaq,
} from '../../../config/pricing.config';
import Breadcrumb from '../components/Breadcrumb';
import PageSeo from '../../../components/PageSeo';
import { SEO_DEFAULTS } from '../../../config/seo.config';
import '../styles/page-shared.css';
import './PricingPage.css';

// カテゴリ早見表用のアイコン解決マップ
const CATEGORY_ICONS = {
    pet: PawPrint,
    businesscard: IdCard,
    manga: BookOpen,
};

const BREADCRUMB = [
    { label: 'ホーム', to: '/' },
    { label: '料金プラン', to: null },
];

const buildPricingJsonLd = () => ({
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `${SEO_DEFAULTS.siteName} 料金プラン`,
    url: `${SEO_DEFAULTS.siteUrl}/pricing`,
    provider: {
        '@type': 'Organization',
        name: SEO_DEFAULTS.siteName,
        url: SEO_DEFAULTS.siteUrl,
    },
    itemListElement: pricingPlans.map((p, idx) => ({
        '@type': 'Offer',
        position: idx + 1,
        name: p.name,
        priceCurrency: 'JPY',
        price: typeof p.price === 'number' ? p.price : undefined,
        description: p.description || undefined,
        category: p.category,
    })),
});

function PageHero() {
    return (
        <header className="kt-page-hero">
            <div className="kt-page-hero__inner">
                <h1 className="kt-page-hero__title">料金プラン</h1>
                <p className="kt-page-hero__lead">
                    制作物のジャンル別に基本プランをご用意しています。<br />
                    ご相談ベースでの調整も柔軟に承ります。
                </p>
            </div>
        </header>
    );
}

function CategoryJumpNav({ categories }) {
    return (
        <nav className="kt-pricing-jump" aria-label="プラン カテゴリへの早見表">
            <div className="kt-pricing-jump__inner">
                {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.id] ?? Sparkles;
                    return (
                        <a
                            key={cat.id}
                            href={`#cat-${cat.id}`}
                            className="kt-pricing-jump__card"
                        >
                            <span className="kt-pricing-jump__icon" aria-hidden="true">
                                <Icon size={26} strokeWidth={1.6} />
                            </span>
                            <span className="kt-pricing-jump__label">{cat.label}</span>
                            <span className="kt-pricing-jump__arrow" aria-hidden="true">
                                <ArrowRight size={16} />
                            </span>
                        </a>
                    );
                })}
            </div>
        </nav>
    );
}

function PlanCard({ plan }) {
    return (
        <article
            className={`kt-plan-card${plan.popular ? ' kt-plan-card--popular' : ''}`}
        >
            {plan.popular && plan.badge && (
                <span className="kt-plan-card__badge">{plan.badge}</span>
            )}
            <h3 className="kt-plan-card__name">{plan.name}</h3>
            <p className="kt-plan-card__tagline">{plan.tagline}</p>
            <div className="kt-plan-card__price">
                <span className="kt-plan-card__price-value">{plan.priceLabel}</span>
                {plan.priceUnit && (
                    <span className="kt-plan-card__price-unit">／{plan.priceUnit}</span>
                )}
            </div>
            <ul className="kt-plan-card__features">
                {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                ))}
            </ul>
            <p className="kt-plan-card__delivery">納期目安：約{plan.deliveryDays}日</p>
            {plan.note && <p className="kt-plan-card__note">{plan.note}</p>}
            <Link to={plan.cta.to} className="kt-btn kt-btn--primary">
                {plan.cta.label}
            </Link>
        </article>
    );
}

function PricingCategorySection({ category, plans, alt }) {
    return (
        <section
            id={`cat-${category.id}`}
            className={`kt-section${alt ? ' kt-section--alt' : ''}`}
        >
            <div className="kt-section__inner">
                <h2 className="kt-section__title">{category.label}</h2>
                {category.description && (
                    <p className="kt-section__lead">{category.description}</p>
                )}
                <div className="kt-plan-grid">
                    {plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
                </div>
            </div>
        </section>
    );
}

function NotesSection() {
    return (
        <section className="kt-section">
            <div className="kt-section__inner kt-section__inner--narrow">
                <h2 className="kt-section__title">ご注意事項</h2>
                <ul className="kt-notes">
                    {pricingNotes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
            </div>
        </section>
    );
}

function FaqSection() {
    return (
        <section className="kt-section kt-section--alt">
            <div className="kt-section__inner kt-section__inner--narrow">
                <h2 className="kt-section__title">よくあるご質問</h2>
                <dl className="kt-faq">
                    {pricingFaq.map((it, i) => (
                        <div key={i} className="kt-faq__item">
                            <dt className="kt-faq__q">Q. {it.q}</dt>
                            <dd className="kt-faq__a">{it.a}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

function DiagnosticTeaserSection() {
    return (
        <section className="kt-section">
            <div className="kt-pricing-diag">
                <span className="kt-pricing-diag__icon" aria-hidden="true">
                    <Sparkles size={32} strokeWidth={1.5} />
                </span>
                <div className="kt-pricing-diag__body">
                    <h2 className="kt-pricing-diag__title">迷ったら無料診断</h2>
                    <p className="kt-pricing-diag__desc">
                        いくつかの質問に答えるだけで、あなたに合った制作プランの方向性をご提案します。
                    </p>
                </div>
                <Link to="/diagnostic" className="kt-btn kt-btn--primary">
                    無料診断を試す →
                </Link>
            </div>
        </section>
    );
}

function BigCtaSection() {
    return (
        <section className="kt-bigcta">
            <div className="kt-bigcta__inner">
                <h2 className="kt-bigcta__title">
                    プランの詳細やカスタマイズもご相談ください
                </h2>
                <Link to="/contact" className="kt-btn kt-btn--white kt-btn--lg">
                    相談する →
                </Link>
            </div>
        </section>
    );
}

export default function PricingPage() {
    const sortedCategories = [...pricingCategories].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

    return (
        <div className="kt-page">
            <PageSeo pageKey="pricing" extraJsonLd={[buildPricingJsonLd()]} />
            <Breadcrumb items={BREADCRUMB} />
            <PageHero />
            <CategoryJumpNav categories={sortedCategories} />
            {sortedCategories.map((cat, idx) => {
                const plans = pricingPlans.filter((p) => p.category === cat.id);
                if (plans.length === 0) return null;
                return (
                    <PricingCategorySection
                        key={cat.id}
                        category={cat}
                        plans={plans}
                        alt={idx % 2 === 1}
                    />
                );
            })}
            <NotesSection />
            <FaqSection />
            <DiagnosticTeaserSection />
            <BigCtaSection />
        </div>
    );
}
