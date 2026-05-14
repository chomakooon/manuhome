/**
 * @file src/sites/kataribin/pages/KataribinHomePage.jsx
 *
 * カタチ便（メイン HP）のホームページ。
 * Phase 19: ブランディング論を反映した 3 セクション追加（悩み / 5 つの強み / Before-After）。
 *
 * セクション構成:
 *   1. Hero (画像フルワイド + CTA)
 *   2. お悩み確認 (★Phase 19 追加: 悩み言語化)
 *   3. こんな方におすすめ (Phase 19: トーン調整)
 *   4. 安心ポイント 3カラム
 *   5. カタチ便の 5 つの強み (★Phase 19 追加: 独自性の明示)
 *   6. 制作事例ティザー (代表6件)
 *   7. Before → After (★Phase 19 追加: 変化の可視化)
 *   8. 数字で見るカタチ便
 *   9. お客様の声
 *  10. 運営者紹介
 *  11. プラン紹介ティザー  → /pricing 直行
 *  12. 制作の流れティザー  → /flow 直行
 *  13. PAWS PRESS への誘導
 *  14. 大型 CTA
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageCircle, Clock, Palette, Quote,
    Briefcase, Utensils, Heart, Building2,
    BookOpen, GitBranch, Sparkles, Bot, ArrowRight,
} from 'lucide-react';
import { portfolioItems } from '../../../data/portfolioData';
import { SITE_STATS } from '../../../config/site-stats.config';
import { TESTIMONIALS } from '../../../config/testimonials.config';
import { PERSONAS } from '../../../config/personas.config';
import { PROFILE, PROFILE_INITIALS } from '../../../config/profile.config';
import { CONCERNS } from '../../../config/concerns.config';
import { STRENGTHS } from '../../../config/strengths.config';
import { BEFORE_AFTER_CASES } from '../../../config/before-after.config';
import PortraitPhoto from '../components/PortraitPhoto';
import PageSeo from '../../../components/PageSeo';
import PictureWebp from '../../../components/PictureWebp';
import useScrollReveal from '../hooks/useScrollReveal';
import useCountUp from '../hooks/useCountUp';
import '../styles/page-shared.css';
import './KataribinHomePage.css';

const PERSONA_ICONS = { Briefcase, Utensils, Heart, Building2 };
const STRENGTH_ICONS = { Palette, BookOpen, GitBranch, Sparkles, Bot };

const HERO_IMAGE = '/hero/kataribin-hero.jpg';
const PAWSPRESS_LOGO = '/hero/pawspress-logo.jpg';

const FLOW_STEPS = [
    { num: 1, title: 'お問い合わせ', desc: 'ご相談・ヒアリング' },
    { num: 2, title: 'お見積り', desc: 'ご要件整理' },
    { num: 3, title: '制作', desc: 'ラフ確認 → 仕上げ' },
    { num: 4, title: '納品', desc: 'データ納品 / 物販' },
];

const TRUST_CARDS = [
    {
        icon: MessageCircle,
        title: 'まずは無料で相談',
        desc: 'お見積りまで完全無料。必要事項を伺うだけで、無理な営業はいたしません。',
    },
    {
        icon: Clock,
        title: '迅速対応',
        desc: '平日24時間以内にご返信。急ぎの案件もまずはご相談ください。',
    },
    {
        icon: Palette,
        title: 'ご要望に寄り添う',
        desc: 'マンガ調・アニメ調・リアル調まで対応。雰囲気イメージのご相談から承ります。',
    },
];

const onImgError = (label) => (e) => {
    console.warn(`[kt] ${label} image missing: ${e.currentTarget.src}`);
};

// ── Sections ──────────────────────────────────

function HeroSection() {
    return (
        <section className="kt-hero">
            <PictureWebp
                src={HERO_IMAGE}
                alt="カタチ便のメインビジュアル：『伝えたいを、イラストで一瞬に。』岡崎真奈による漫画・キャラクターデザイン・リアルペットイラストの作例と、平日対応・テイスト調整 OK の対応方針"
                className="kt-hero__media"
                loading="eager"
                onError={onImgError('hero')}
                onLoad={(e) => e.currentTarget.classList.add('loaded')}
            />
            <div className="kt-hero__cta">
                <Link to="/contact" className="kt-btn kt-btn--primary kt-btn--xl">
                    <span className="kt-btn__main">無料で相談する →</span>
                    <span className="kt-btn__sub">ヒアリングのみ・営業電話なし</span>
                </Link>
            </div>
        </section>
    );
}

function ConcernsSection() {
    const revealRef = useScrollReveal();
    return (
        <section
            ref={revealRef}
            className="kt-concerns-section reveal"
            aria-labelledby="kt-concerns-title"
        >
            <div className="kt-concerns-section__inner">
                <h2 id="kt-concerns-title" className="kt-section__title">
                    こんなお悩み、ありませんか？
                </h2>
                <p className="kt-section__lead">
                    ひとつでも当てはまるなら、ご相談ください。
                </p>
                <ul className="kt-concerns-grid">
                    {CONCERNS.map((c) => (
                        <li key={c.id} className="kt-concern-card">
                            <span
                                className="kt-concern-card__icon"
                                aria-hidden="true"
                            >
                                {c.icon}
                            </span>
                            <p className="kt-concern-card__text">{c.text}</p>
                        </li>
                    ))}
                </ul>
                <div className="kt-concerns-section__outro">
                    <p className="kt-concerns-section__bridge">
                        これらはすべて「世界観の設計」で解決できます。
                    </p>
                    <a
                        href="#kt-strengths"
                        className="kt-concerns-section__jump"
                    >
                        カタチ便のアプローチを見る ↓
                    </a>
                </div>
            </div>
        </section>
    );
}

function StrengthsSection() {
    const revealRef = useScrollReveal();
    return (
        <section
            ref={revealRef}
            id="kt-strengths"
            className="kt-strengths-section reveal"
            aria-labelledby="kt-strengths-title"
        >
            <div className="kt-strengths-section__inner">
                <h2 id="kt-strengths-title" className="kt-section__title">
                    カタチ便ができること
                </h2>
                <p className="kt-section__lead">
                    単なる制作ではない、5 つの専門性。
                </p>
                <ul className="kt-strengths-list">
                    {STRENGTHS.map((s) => {
                        const Icon = STRENGTH_ICONS[s.icon];
                        return (
                            <li key={s.id} className="kt-strength-row">
                                <span
                                    className="kt-strength-row__num"
                                    aria-hidden="true"
                                >
                                    {s.id}
                                </span>
                                <div className="kt-strength-row__body">
                                    <h3 className="kt-strength-row__title">
                                        {s.title}
                                        <span className="kt-strength-row__subtitle">
                                            {s.subtitle}
                                        </span>
                                    </h3>
                                    <p className="kt-strength-row__desc">
                                        {s.description}
                                    </p>
                                </div>
                                <span
                                    className="kt-strength-row__icon"
                                    aria-hidden="true"
                                >
                                    {Icon && <Icon size={32} strokeWidth={1.5} />}
                                </span>
                            </li>
                        );
                    })}
                </ul>
                <div className="kt-strengths-section__cta">
                    <p className="kt-strengths-section__bridge">
                        あなたのビジネスに必要な力を、お選びください。
                    </p>
                    <Link
                        to="/contact"
                        className="kt-btn kt-btn--primary kt-btn--xl"
                    >
                        <span className="kt-btn__main">無料で相談する →</span>
                        <span className="kt-btn__sub">
                            ヒアリングのみ・営業電話なし
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

function BeforeAfterSection() {
    const revealRef = useScrollReveal();
    return (
        <section
            ref={revealRef}
            className="kt-ba-section reveal"
            aria-labelledby="kt-ba-title"
        >
            <div className="kt-ba-section__inner">
                <h2 id="kt-ba-title" className="kt-section__title">
                    Before → After
                </h2>
                <p className="kt-section__lead">ご依頼前と、ご依頼後の変化。</p>
                <ul className="kt-ba-list">
                    {BEFORE_AFTER_CASES.map((c) => (
                        <li key={c.id} className="kt-ba-card">
                            <h3 className="kt-ba-card__title">{c.title}</h3>
                            <p className="kt-ba-card__challenge">
                                <span className="kt-ba-card__challenge-label">
                                    課題
                                </span>
                                {c.challenge}
                            </p>
                            <div className="kt-ba-card__pair">
                                <div className="kt-ba-card__side kt-ba-card__side--before">
                                    <span className="kt-ba-card__badge kt-ba-card__badge--before">
                                        BEFORE
                                    </span>
                                    <p className="kt-ba-card__text">
                                        {c.beforeText}
                                    </p>
                                </div>
                                <span
                                    className="kt-ba-card__arrow"
                                    aria-hidden="true"
                                >
                                    <ArrowRight size={28} strokeWidth={2} />
                                </span>
                                <div className="kt-ba-card__side kt-ba-card__side--after">
                                    <span className="kt-ba-card__badge kt-ba-card__badge--after">
                                        AFTER
                                    </span>
                                    <div className="kt-ba-card__image">
                                        <PictureWebp
                                            src={c.afterImage}
                                            alt={c.afterAlt}
                                            loading="lazy"
                                            onError={onImgError(`ba-${c.id}`)}
                                        />
                                    </div>
                                    <p className="kt-ba-card__text">
                                        {c.afterText}
                                    </p>
                                </div>
                            </div>
                            <p className="kt-ba-card__solution">
                                <span className="kt-ba-card__solution-label">
                                    解決策
                                </span>
                                {c.solution}
                            </p>
                            <ul className="kt-ba-card__tags">
                                {c.tags.map((tag) => (
                                    <li key={tag} className="kt-ba-card__tag">
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function PersonasSection() {
    const revealRef = useScrollReveal();
    return (
        <section ref={revealRef} className="kt-personas-section reveal">
            <div className="kt-personas-section__inner">
                <h2 className="kt-section__title">こんな方におすすめです</h2>
                <p className="kt-section__lead">
                    あなたのニーズに合わせて、最適なプランをご提案します。
                </p>
                <ul className="kt-personas-grid">
                    {PERSONAS.map((p) => {
                        const Icon = PERSONA_ICONS[p.icon];
                        return (
                            <li key={p.id} className="kt-persona-card">
                                <div className="kt-persona-card__icon" aria-hidden="true">
                                    {Icon && <Icon size={28} strokeWidth={1.5} />}
                                </div>
                                <h3 className="kt-persona-card__title">{p.title}</h3>
                                <p className="kt-persona-card__problem">
                                    <span aria-hidden="true">💭 </span>{p.problem}
                                </p>
                                <p className="kt-persona-card__solution">
                                    <span aria-hidden="true">✨ </span>{p.solution}
                                </p>
                                <p className="kt-persona-card__plan">
                                    推奨プラン: {p.recommendedPlan}
                                </p>
                                <Link
                                    to={p.ctaLink}
                                    className="kt-btn kt-btn--outline kt-persona-card__cta"
                                >
                                    {p.ctaText}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

function TrustSection() {
    const revealRef = useScrollReveal();
    return (
        <section ref={revealRef} className="kt-trust-section reveal">
            <span className="kt-trust-section__eyebrow">初めての方へ</span>
            <div className="kt-trust-grid">
                {TRUST_CARDS.map((c) => {
                    const Icon = c.icon;
                    return (
                        <article key={c.title} className="kt-trust-card">
                            <div className="kt-trust-card__icon" aria-hidden="true">
                                <Icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="kt-trust-card__title">{c.title}</h3>
                            <p className="kt-trust-card__desc">{c.desc}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function PortfolioTeaserSection({ items }) {
    const revealRef = useScrollReveal();
    return (
        <section ref={revealRef} className="kt-section kt-section--alt reveal">
            <div className="kt-section__inner">
                <h2 className="kt-section__title">制作事例</h2>
                <div className="kt-portfolio-grid">
                    {items.map((it) => (
                        <Link
                            key={it.id}
                            to={`/portfolio/${it.subCategory}`}
                            className="kt-portfolio-card"
                        >
                            <div className="kt-portfolio-card__img">
                                <PictureWebp
                                    src={it.image}
                                    alt={it.title}
                                    loading="lazy"
                                    onError={onImgError(`portfolio (id=${it.id})`)}
                                />
                            </div>
                            <div className="kt-portfolio-card__caption">{it.title}</div>
                        </Link>
                    ))}
                </div>
                <div className="kt-section__cta">
                    <Link to="/portfolio" className="kt-btn kt-btn--outline">
                        もっと見る →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function StatNumber({ value }) {
    const { ref, display } = useCountUp(value);
    return <span ref={ref}>{display}</span>;
}

function StatsSection() {
    const revealRef = useScrollReveal();
    return (
        <section ref={revealRef} className="kt-stats-section reveal">
            <div className="kt-stats-section__inner">
                <span className="kt-stats-section__eyebrow">数字で見るカタチ便</span>
                <ul className="kt-stats-grid">
                    {SITE_STATS.map((s) => (
                        <li key={s.id} className="kt-stat-card">
                            <span className="kt-stat-card__value">
                                <StatNumber value={s.value} />
                                <span className="kt-stat-card__unit">{s.unit}</span>
                            </span>
                            <span className="kt-stat-card__label">{s.label}</span>
                            {s.note && (
                                <span className="kt-stat-card__note">{s.note}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function TestimonialsSection() {
    const revealRef = useScrollReveal();
    return (
        <section ref={revealRef} className="kt-section reveal">
            <div className="kt-section__inner">
                <h2 className="kt-section__title">お客様の声</h2>
                <p className="kt-section__lead">
                    ご依頼いただいた皆さまから、ありがたい感想をいただいています。
                </p>
                <ul className="kt-testimonials">
                    {TESTIMONIALS.map((t) => (
                        <li key={t.id} className="kt-testimonial-card">
                            <Quote
                                className="kt-testimonial-card__icon"
                                size={28}
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />
                            <p className="kt-testimonial-card__body">{t.body}</p>
                            <div className="kt-testimonial-card__meta">
                                <span className="kt-testimonial-card__name">{t.name}</span>
                                <span className="kt-testimonial-card__role">{t.role}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function CreatorTeaserSection() {
    const revealRef = useScrollReveal();
    return (
        <section ref={revealRef} className="kt-section reveal">
            <div className="kt-section__inner kt-creator-teaser">
                <div className="kt-creator-teaser__photo">
                    <PortraitPhoto
                        src={PROFILE.photo}
                        alt={`${PROFILE.name} のプロフィール写真`}
                        initials={PROFILE_INITIALS}
                        size="md"
                        shape="circle"
                    />
                </div>
                <div className="kt-creator-teaser__body">
                    <p className="kt-creator-teaser__eyebrow">運営者紹介</p>
                    <h2 className="kt-creator-teaser__name">
                        {PROFILE.name}
                        <span className="kt-creator-teaser__name-en" lang="en">
                            / {PROFILE.nameEn}
                        </span>
                    </h2>
                    <p className="kt-creator-teaser__title">{PROFILE.title}</p>
                    <p className="kt-creator-teaser__message">
                        {PROFILE.homeMessage}
                    </p>
                    <Link to="/about" className="kt-btn kt-btn--outline">
                        詳しいプロフィール →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PlansTeaserSection() {
    return (
        <section className="kt-section">
            <div className="kt-section__inner kt-section__inner--narrow">
                <h2 className="kt-section__title">ご相談ベースで柔軟に対応</h2>
                <p className="kt-section__lead">
                    ご利用シーン・ご予算に応じてプランをご用意しています。<br />
                    詳細な料金表とよくあるご質問はこちらから。
                </p>
                <div className="kt-section__cta">
                    <Link to="/pricing" className="kt-btn kt-btn--primary">
                        料金プラン詳細 →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function FlowTeaserSection() {
    return (
        <section className="kt-section kt-section--alt">
            <div className="kt-section__inner">
                <h2 className="kt-section__title">ご相談から納品まで</h2>
                <ol className="kt-flow">
                    {FLOW_STEPS.map((s) => (
                        <li key={s.num} className="kt-flow__step">
                            <span className="kt-flow__num">{s.num}</span>
                            <h3 className="kt-flow__title">{s.title}</h3>
                            <p className="kt-flow__desc">{s.desc}</p>
                        </li>
                    ))}
                </ol>
                <div className="kt-section__cta">
                    <Link to="/flow" className="kt-btn kt-btn--outline">
                        詳しい制作の流れ →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PawsPressTeaserSection() {
    const revealRef = useScrollReveal();
    return (
        <section ref={revealRef} className="kt-pp-cross reveal">
            <div className="kt-pp-cross__inner">
                <PictureWebp
                    src={PAWSPRESS_LOGO}
                    alt="PAWS PRESS"
                    className="kt-pp-cross__logo"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <h2 className="kt-pp-cross__title">ペットグッズ専門ブランドはこちら</h2>
                <p className="kt-pp-cross__desc">
                    うちの子の写真を、世界に一つのイラストグッズに。<br />
                    ペットイラスト・グッズ制作専門のPAWS PRESSをご覧ください。
                </p>
                <Link to="/pet" className="kt-btn kt-btn--primary">
                    PAWS PRESS を見る →
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
                    あなたの「伝えたい」を、<br />形にしませんか？
                </h2>
                <Link to="/contact" className="kt-btn kt-btn--white kt-btn--xl">
                    <span className="kt-btn__main">無料で相談する →</span>
                    <span className="kt-btn__sub">24時間以内に返信・お見積り無料</span>
                </Link>
            </div>
        </section>
    );
}

// ── Main ──────────────────────────────────────

export default function KataribinHomePage() {
    // 代表作6件: isMain かつ shop（商品）以外
    const teaserItems = useMemo(
        () => portfolioItems.filter((i) => i.isMain && i.category !== 'shop').slice(0, 6),
        []
    );

    return (
        <div className="kt-home">
            <PageSeo pageKey="home" />
            <HeroSection />
            <ConcernsSection />
            <PersonasSection />
            <TrustSection />
            <StrengthsSection />
            <PortfolioTeaserSection items={teaserItems} />
            <BeforeAfterSection />
            <StatsSection />
            <TestimonialsSection />
            <CreatorTeaserSection />
            <PlansTeaserSection />
            <FlowTeaserSection />
            <PawsPressTeaserSection />
            <BigCtaSection />
        </div>
    );
}
