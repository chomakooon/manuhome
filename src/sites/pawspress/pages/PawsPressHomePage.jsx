/**
 * @file src/sites/pawspress/pages/PawsPressHomePage.jsx
 *
 * PAWS PRESS のトップ LP。5セクションで構成される独立 LP として表示する。
 *  1. ヒーロー
 *  2. プラン (id="plans" — ナビ '/pet#plans' のスクロール先)
 *  3. ビフォーアフター
 *  4. 制作実績ギャラリー（既存 PortfolioModal を再利用）
 *  5. 大型 CTA
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { portfolioItems } from '../../../data/portfolioData';
import { pawspressPlans } from '../data/plans';
import PortfolioModal from '../../../components/ui/PortfolioModal';
import PageSeo from '../../../components/PageSeo';
import './PawsPressHomePage.css';

const SUB_CATEGORY_LABEL = {
    pet_photo: 'お写真',
    pet_illust: 'イラスト',
    pet_goods: 'グッズ',
};

const onImgError = (label) => (e) => {
    console.warn(`[paws] ${label} image missing: ${e.currentTarget.src}`);
};

function HeroSection({ heroImage }) {
    return (
        <section className="paws-hero">
            <div className="paws-hero__inner">
                <div className="paws-hero__text">
                    <h1 className="paws-hero__title">
                        うちの子の写真を、<br />
                        世界に一つのグッズに。
                    </h1>
                    <p className="paws-hero__subtitle">
                        PAWS PRESSは、あなたの大切な家族（犬・猫）を温かみのあるタッチで描き、
                        Tシャツやマグカップに残せるペットグッズ専門ブランドです。
                    </p>
                    <Link to="/pet/order" className="paws-btn paws-btn--primary paws-btn--lg">
                        写真を送って注文する →
                    </Link>
                    <p className="paws-hero__note">平日対応・全国送料無料</p>
                </div>
                <div className="paws-hero__visual">
                    <img
                        src={heroImage}
                        alt="ペットイラスト制作の例"
                        loading="eager"
                        onError={onImgError('hero')}
                    />
                </div>
            </div>
        </section>
    );
}

function PlansSection() {
    return (
        <section className="paws-plans" id="plans">
            <div className="paws-plans__inner">
                <h2 className="paws-section-title">プランから選ぶ</h2>
                <div className="paws-plans__grid">
                    {pawspressPlans.map((plan) => (
                        <article
                            key={plan.id}
                            className={`paws-plan-card${plan.popular ? ' paws-plan-card--popular' : ''}`}
                        >
                            {plan.popular && plan.badge && (
                                <span className="paws-plan-card__badge">{plan.badge}</span>
                            )}
                            <h3 className="paws-plan-card__name">{plan.name}</h3>
                            <p className="paws-plan-card__tagline">{plan.tagline}</p>
                            <div className="paws-plan-card__price">{plan.priceLabel}</div>
                            <ul className="paws-plan-card__features">
                                {plan.features.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                            <p className="paws-plan-card__delivery">納期目安：約{plan.deliveryDays}日</p>
                            <Link
                                to={`/pet/order?plan=${plan.id}`}
                                className="paws-btn paws-btn--primary"
                            >
                                このプランで相談する
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FlowStep({ n, title, image, alt }) {
    return (
        <div className="paws-flow__step">
            <div className="paws-flow__num">STEP {n}</div>
            <div className="paws-flow__img">
                <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    onError={onImgError(`flow step ${n}`)}
                />
            </div>
            <h3 className="paws-flow__title">{title}</h3>
        </div>
    );
}

function FlowSection({ photo, illust, goods }) {
    return (
        <section className="paws-flow">
            <div className="paws-flow__inner">
                <h2 className="paws-section-title">写真から、世界にひとつのグッズへ</h2>
                <div className="paws-flow__steps">
                    <FlowStep n={1} title="お写真を送る" image={photo} alt="お写真サンプル" />
                    <FlowStep n={2} title="イラストに変換" image={illust} alt="イラスト変換例" />
                    <FlowStep n={3} title="グッズになって届く" image={goods} alt="完成グッズ例" />
                </div>
            </div>
        </section>
    );
}

function GallerySection({ items, onOpen }) {
    return (
        <section className="paws-gallery">
            <div className="paws-gallery__inner">
                <h2 className="paws-section-title">これまでの制作</h2>
                <div className="paws-gallery__grid">
                    {items.map((item, idx) => (
                        <button
                            type="button"
                            key={item.id}
                            className="paws-gallery__item"
                            onClick={() => onOpen(idx)}
                            aria-label={`${item.title} を拡大して見る`}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                loading="lazy"
                                onError={onImgError(`gallery (id=${item.id})`)}
                            />
                        </button>
                    ))}
                </div>
                <div className="paws-gallery__more">
                    <Link to="/portfolio" className="paws-btn paws-btn--outline">
                        もっと見る
                    </Link>
                </div>
            </div>
        </section>
    );
}

function BigCtaSection() {
    return (
        <section className="paws-bigcta">
            <div className="paws-bigcta__inner">
                <h2 className="paws-bigcta__title">うちの子だけの一品を、今すぐ</h2>
                <p className="paws-bigcta__sub">写真1枚から、最短7日でお届け</p>
                <Link to="/pet/order" className="paws-btn paws-btn--white paws-btn--lg">
                    写真を送って注文する →
                </Link>
            </div>
        </section>
    );
}

export default function PawsPressHomePage() {
    const location = useLocation();

    // ── data ────────────────────────────────
    const petItems = useMemo(
        () => portfolioItems.filter((it) => it.category === 'pet'),
        []
    );

    const photoItem = useMemo(() => portfolioItems.find((i) => i.id === 'pet-photo-01'), []);
    const illustItem = useMemo(() => portfolioItems.find((i) => i.id === 'pet-illust-01'), []);
    const goodsItem = useMemo(() => portfolioItems.find((i) => i.id === 'pet-goods-01'), []);

    // ── modal state ─────────────────────────
    const [modalIndex, setModalIndex] = useState(-1);
    const isModalOpen = modalIndex >= 0;
    const modalItem = isModalOpen
        ? {
              ...petItems[modalIndex],
              categoryName: SUB_CATEGORY_LABEL[petItems[modalIndex].subCategory] ?? 'PAWS PRESS',
          }
        : null;

    // ── hash scroll (ナビ '/pet#plans' 等への対応) ──
    useEffect(() => {
        if (!location.hash) return;
        const id = location.hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
            // sticky header の高さ分オフセット
            const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
            return () => clearTimeout(t);
        }
    }, [location.hash]);

    return (
        <div className="paws-home">
            <PageSeo pageKey="pet" />
            <HeroSection heroImage={illustItem?.image ?? '/works/pet-illust-1.jpg'} />
            <PlansSection />
            <FlowSection
                photo={photoItem?.image ?? '/works/pet-photo-1.jpg'}
                illust={illustItem?.image ?? '/works/pet-illust-1.jpg'}
                goods={goodsItem?.image ?? '/works/pet-goods-1.jpg'}
            />
            <GallerySection items={petItems} onOpen={setModalIndex} />
            <BigCtaSection />

            <PortfolioModal
                item={modalItem}
                isOpen={isModalOpen}
                onClose={() => setModalIndex(-1)}
                onNext={() => setModalIndex((i) => Math.min(i + 1, petItems.length - 1))}
                onPrev={() => setModalIndex((i) => Math.max(i - 1, 0))}
                hasNext={isModalOpen && modalIndex < petItems.length - 1}
                hasPrev={isModalOpen && modalIndex > 0}
            />
        </div>
    );
}
