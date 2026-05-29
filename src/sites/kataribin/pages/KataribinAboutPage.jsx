/**
 * @file src/sites/kataribin/pages/KataribinAboutPage.jsx
 *
 * /about の全面リニューアル版（Phase 12 / Credibility 強化）。
 *
 * セクション構成:
 *   1. ヒーロー: 写真 + キャッチコピー
 *   2. はじめまして
 *   3. カタチラボを始めた理由（ストーリー）
 *   4. 3 つのこだわり
 *   5. 制作スタイル
 *   6. お客様に届けたい価値（クロージング）
 *   7. CTA
 *
 * 旧 AboutPage（新聞風レイアウト）は src/pages/public/AboutPage.jsx に
 * 物理ファイルを残置。復元時は App.jsx の `/about` ルートを差し戻すだけ。
 */

import { Link } from 'react-router-dom';
import {
    MessageCircle, Palette, Clock,
    Briefcase, Sparkles, Layers, Calendar,
    Wrench, Home as HomeIcon, Instagram,
} from 'lucide-react';
import { PROFILE, PROFILE_INITIALS } from '../../../config/profile.config';
import { SEO_DEFAULTS } from '../../../config/seo.config';
import { SNS_LINKS } from '../../../config/social.config';
import PortraitPhoto from '../components/PortraitPhoto';
import Breadcrumb from '../components/Breadcrumb';
import PageSeo from '../../../components/PageSeo';
import '../styles/page-shared.css';
import './KataribinAboutPage.css';

const BREADCRUMB = [
    { label: 'ホーム', to: '/' },
    { label: 'カタチラボについて', to: null },
];

const VALUE_ICONS = { MessageCircle, Palette, Clock };

// 数字で見る実績（モック値ベース。実数は profile.config.js / 別 config 化検討）
const STATS = [
    { Icon: Briefcase, value: '6年', label: '個人事業主としての経験' },
    { Icon: Sparkles, value: '500件＋', label: 'のべコンテンツ制作実績' },
    { Icon: Layers, value: '4ジャンル', label: '漫画 / キャラ / 名刺 / ロゴ' },
    { Icon: Calendar, value: '24h以内', label: '平日のご返信目安' },
];

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
                <h2 className="kt-about-section__title">カタチラボを始めた理由</h2>
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

function StatsSection() {
    return (
        <section className="kt-about-section kt-about-section--alt">
            <div className="kt-about-section__inner">
                <h2 className="kt-about-section__title">数字で見る実績</h2>
                <ul className="kt-about-stats">
                    {STATS.map((s) => (
                        <li key={s.label} className="kt-about-stat">
                            <span className="kt-about-stat__icon" aria-hidden="true">
                                <s.Icon size={26} strokeWidth={1.6} />
                            </span>
                            <p className="kt-about-stat__value">{s.value}</p>
                            <p className="kt-about-stat__label">{s.label}</p>
                        </li>
                    ))}
                </ul>
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
                    <h3 className="kt-about-style-block__heading">
                        <Wrench size={20} strokeWidth={1.6} aria-hidden="true" />
                        使用ツール
                    </h3>
                    <ul className="kt-about-tools">
                        {tools.map((t) => (
                            <li key={t} className="kt-about-tool">{t}</li>
                        ))}
                    </ul>
                </div>

                <div className="kt-about-style-block">
                    <h3 className="kt-about-style-block__heading">
                        <HomeIcon size={20} strokeWidth={1.6} aria-hidden="true" />
                        制作環境
                    </h3>
                    <p className="kt-about-paragraph">{environment}</p>
                </div>

                <div className="kt-about-style-block">
                    <h3 className="kt-about-style-block__heading">
                        <Clock size={20} strokeWidth={1.6} aria-hidden="true" />
                        1 日のスケジュール
                    </h3>
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

function SnsSection() {
    return (
        <section className="kt-about-section">
            <div className="kt-about-section__inner kt-about-section__inner--narrow kt-about-sns">
                <h2 className="kt-about-section__title">
                    ペットグッズ制作「もふラボ」では制作情報を発信中
                </h2>
                <p className="kt-about-section__lead">
                    うちの子グッズの制作風景・納品事例・お得なお知らせを、SNS で随時アップしています。フォローでぜひ覗いてみてください。
                </p>
                <div className="kt-about-sns__actions">
                    <a
                        href={SNS_LINKS.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kt-about-sns__btn kt-about-sns__btn--ig"
                    >
                        <Instagram size={18} aria-hidden="true" />
                        Instagram
                    </a>
                    <a
                        href={SNS_LINKS.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kt-about-sns__btn kt-about-sns__btn--x"
                    >
                        <span aria-hidden="true" className="kt-about-sns__xicon">𝕏</span>
                        X (Twitter)
                    </a>
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
            <StatsSection />
            <ValuesSection />
            <StyleSection />
            <ClosingSection />
            <SnsSection />
            <CtaSection />
        </div>
    );
}
