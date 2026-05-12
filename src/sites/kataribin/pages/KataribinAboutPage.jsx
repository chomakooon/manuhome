/**
 * @file src/sites/kataribin/pages/KataribinAboutPage.jsx
 *
 * /about の全面リニューアル版（Phase 12 / Credibility 強化）。
 *
 * セクション構成:
 *   1. ヒーロー: 写真 + キャッチコピー
 *   2. はじめまして
 *   3. カタチ便を始めた理由（ストーリー）
 *   4. 3 つのこだわり
 *   5. 制作スタイル
 *   6. お客様に届けたい価値（クロージング）
 *   7. CTA
 *
 * 旧 AboutPage（新聞風レイアウト）は src/pages/public/AboutPage.jsx に
 * 物理ファイルを残置。復元時は App.jsx の `/about` ルートを差し戻すだけ。
 */

import { Link } from 'react-router-dom';
import { MessageCircle, Palette, Clock } from 'lucide-react';
import { PROFILE, PROFILE_INITIALS } from '../../../config/profile.config';
import { SEO_DEFAULTS } from '../../../config/seo.config';
import PortraitPhoto from '../components/PortraitPhoto';
import Breadcrumb from '../components/Breadcrumb';
import PageSeo from '../../../components/PageSeo';
import '../styles/page-shared.css';
import './KataribinAboutPage.css';

const BREADCRUMB = [
    { label: 'ホーム', to: '/' },
    { label: 'カタチ便について', to: null },
];

const VALUE_ICONS = { MessageCircle, Palette, Clock };

const PERSON_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    alternateName: PROFILE.nameEn,
    jobTitle: PROFILE.title,
    description: PROFILE.intro[0],
    image: `${SEO_DEFAULTS.siteUrl}${PROFILE.photo}`,
    worksFor: {
        '@type': 'Organization',
        name: SEO_DEFAULTS.siteName,
        url: SEO_DEFAULTS.siteUrl,
    },
    url: `${SEO_DEFAULTS.siteUrl}/about`,
};

function HeroSection() {
    return (
        <section className="kt-about-hero">
            <div className="kt-about-hero__inner">
                <div className="kt-about-hero__photo">
                    <PortraitPhoto
                        src={PROFILE.photo}
                        alt={`${PROFILE.name} のプロフィール写真`}
                        initials={PROFILE_INITIALS}
                        size="lg"
                        shape="rounded"
                    />
                </div>
                <div className="kt-about-hero__body">
                    <p className="kt-about-hero__eyebrow" lang="en">About</p>
                    <h1 className="kt-about-hero__tagline">{PROFILE.tagline}</h1>
                    <p className="kt-about-hero__name">
                        {PROFILE.name}
                        <span className="kt-about-hero__name-en" lang="en">
                            / {PROFILE.nameEn}
                        </span>
                    </p>
                    <p className="kt-about-hero__title">{PROFILE.title}</p>
                    <p className="kt-about-hero__career">{PROFILE.career}</p>
                </div>
            </div>
        </section>
    );
}

function IntroSection() {
    return (
        <section className="kt-about-section">
            <div className="kt-about-section__inner">
                <h2 className="kt-about-section__title">
                    はじめまして、{PROFILE.name}です
                </h2>
                <div className="kt-about-section__body">
                    {PROFILE.intro.map((paragraph, idx) => (
                        <p key={idx} className="kt-about-paragraph">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}

function StorySection() {
    return (
        <section className="kt-about-section kt-about-section--alt">
            <div className="kt-about-section__inner">
                <h2 className="kt-about-section__title">カタチ便を始めた理由</h2>
                <div className="kt-about-section__body">
                    {PROFILE.story.map((paragraph, idx) => (
                        <p key={idx} className="kt-about-paragraph kt-about-paragraph--story">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ValuesSection() {
    return (
        <section className="kt-about-section">
            <div className="kt-about-section__inner">
                <h2 className="kt-about-section__title">3 つのこだわり</h2>
                <ul className="kt-about-values">
                    {PROFILE.values.map((v) => {
                        const Icon = VALUE_ICONS[v.icon];
                        return (
                            <li key={v.title} className="kt-about-value-card">
                                <div
                                    className="kt-about-value-card__icon"
                                    aria-hidden="true"
                                >
                                    {Icon && <Icon size={28} strokeWidth={1.5} />}
                                </div>
                                <h3 className="kt-about-value-card__title">{v.title}</h3>
                                <p className="kt-about-value-card__desc">{v.desc}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

function StyleSection() {
    const { tools, environment, schedule } = PROFILE.style;
    return (
        <section className="kt-about-section kt-about-section--alt">
            <div className="kt-about-section__inner">
                <h2 className="kt-about-section__title">制作スタイル</h2>

                <div className="kt-about-style-block">
                    <h3 className="kt-about-style-block__heading">使用ツール</h3>
                    <ul className="kt-about-tools">
                        {tools.map((t) => (
                            <li key={t} className="kt-about-tool">{t}</li>
                        ))}
                    </ul>
                </div>

                <div className="kt-about-style-block">
                    <h3 className="kt-about-style-block__heading">制作環境</h3>
                    <p className="kt-about-paragraph">{environment}</p>
                </div>

                <div className="kt-about-style-block">
                    <h3 className="kt-about-style-block__heading">1 日のスケジュール</h3>
                    <ol className="kt-about-schedule">
                        {schedule.map((s) => (
                            <li key={s.time} className="kt-about-schedule__item">
                                <span className="kt-about-schedule__time">{s.time}</span>
                                <span className="kt-about-schedule__task">{s.task}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

function ClosingSection() {
    return (
        <section className="kt-about-section">
            <div className="kt-about-section__inner kt-about-section__inner--narrow">
                <h2 className="kt-about-section__title">お客様に届けたい価値</h2>
                <div className="kt-about-section__body">
                    {PROFILE.closing.map((paragraph, idx) => (
                        <p key={idx} className="kt-about-paragraph">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    return (
        <section className="kt-bigcta">
            <div className="kt-bigcta__inner">
                <h2 className="kt-bigcta__title">
                    まずはお気軽にご相談ください
                </h2>
                <Link to="/contact" className="kt-btn kt-btn--white kt-btn--xl">
                    <span className="kt-btn__main">無料で相談する →</span>
                    <span className="kt-btn__sub">ヒアリング・お見積り無料</span>
                </Link>
            </div>
        </section>
    );
}

export default function KataribinAboutPage() {
    return (
        <div className="kt-page kt-about">
            <PageSeo pageKey="about" extraJsonLd={[PERSON_JSON_LD]} />
            <Breadcrumb items={BREADCRUMB} />
            <HeroSection />
            <IntroSection />
            <StorySection />
            <ValuesSection />
            <StyleSection />
            <ClosingSection />
            <CtaSection />
        </div>
    );
}
