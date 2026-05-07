/**
 * @file src/sites/kataribin/pages/PricingPage.jsx
 *
 * /pricing 独立ページ。料金プランの全カタログ表示。
 * データソース: src/config/pricing.config.js
 */

import { Link } from 'react-router-dom';
import {
    pricingCategories,
    pricingPlans,
    pricingNotes,
    pricingFaq,
} from '../../../config/pricing.config';
import '../styles/page-shared.css';
import './PricingPage.css';

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
        <section className={`kt-section${alt ? ' kt-section--alt' : ''}`}>
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
            <PageHero />
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
            <BigCtaSection />
        </div>
    );
}
