/**
 * @file src/sites/kataribin/pages/KataribinHomePage.jsx
 *
 * カタチ便（メイン HP）のホームページ。
 * Phase B: ヒーロー画像フルワイド対応 + 強み3カラム削除
 *   （画像内に「漫画・キャラ・リアル」紹介および主要メッセージが既に含まれているため重複を排除）。
 *
 * セクション構成:
 *   1. Hero (画像フルワイド + CTA のみ)
 *   2. 制作事例ティザー (代表6件)
 *   3. プラン紹介ティザー  (id="pricing")
 *   4. 制作の流れティザー  (id="flow")
 *   5. PAWS PRESS への誘導
 *   6. 大型 CTA
 */

import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { portfolioItems } from '../../../data/portfolioData';
import './KataribinHomePage.css';

const HERO_IMAGE = '/hero/kataribin-hero.jpg';
const PAWSPRESS_LOGO = '/hero/pawspress-logo.jpg';

const FLOW_STEPS = [
    { num: 1, title: 'お問い合わせ', desc: 'ご相談・ヒアリング' },
    { num: 2, title: 'お見積り', desc: 'ご要件整理' },
    { num: 3, title: '制作', desc: 'ラフ確認 → 仕上げ' },
    { num: 4, title: '納品', desc: 'データ納品 / 物販' },
];

const onImgError = (label) => (e) => {
    console.warn(`[kt] ${label} image missing: ${e.currentTarget.src}`);
};

// ── Sections ──────────────────────────────────

function HeroSection() {
    return (
        <section className="kt-hero">
            <img
                src={HERO_IMAGE}
                alt="カタチ便 — Illustration for your story / 岡崎真奈 / 漫画・キャラ・リアル幅広く制作いたします"
                className="kt-hero__media"
                loading="eager"
                onError={onImgError('hero')}
            />
            <div className="kt-hero__cta">
                <Link to="/intake" className="kt-btn kt-btn--primary kt-btn--lg">
                    相談する →
                </Link>
            </div>
        </section>
    );
}

function PortfolioTeaserSection({ items }) {
    return (
        <section className="kt-section kt-section--alt">
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
                                <img
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

function PlansTeaserSection() {
    return (
        <section className="kt-section" id="pricing">
            <div className="kt-section__inner kt-section__inner--narrow">
                <h2 className="kt-section__title">ご相談ベースで柔軟に対応</h2>
                <p className="kt-section__lead">
                    ご利用シーン・ご予算に応じてプランをご用意しています。<br />
                    詳細な料金表とよくあるご質問はこちらから。
                </p>
                <div className="kt-section__cta">
                    <Link to="/#pricing" className="kt-btn kt-btn--primary">
                        料金プラン詳細 →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function FlowTeaserSection() {
    return (
        <section className="kt-section kt-section--alt" id="flow">
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
                    <Link to="/#flow" className="kt-btn kt-btn--outline">
                        詳しい制作の流れ →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function PawsPressTeaserSection() {
    return (
        <section className="kt-pp-cross">
            <div className="kt-pp-cross__inner">
                <img
                    src={PAWSPRESS_LOGO}
                    alt="PAWS PRESS"
                    className="kt-pp-cross__logo"
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
                <Link to="/intake" className="kt-btn kt-btn--white kt-btn--lg">
                    相談する →
                </Link>
            </div>
        </section>
    );
}

// ── Main ──────────────────────────────────────

export default function KataribinHomePage() {
    const location = useLocation();

    // 代表作6件: isMain かつ shop（商品）以外
    const teaserItems = useMemo(
        () => portfolioItems.filter((i) => i.isMain && i.category !== 'shop').slice(0, 6),
        []
    );

    useEffect(() => {
        if (!location.hash) return;
        const id = location.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
            const t = setTimeout(
                () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                80
            );
            return () => clearTimeout(t);
        }
    }, [location.hash, location.key]);

    return (
        <div className="kt-home">
            <HeroSection />
            <PortfolioTeaserSection items={teaserItems} />
            <PlansTeaserSection />
            <FlowTeaserSection />
            <PawsPressTeaserSection />
            <BigCtaSection />
        </div>
    );
}
