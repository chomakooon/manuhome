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
import { pawspressPlans, GIFT_WRAP_OPTION } from '../data/plans';
import PortfolioModal from '../../../components/ui/PortfolioModal';
import PageSeo from '../../../components/PageSeo';
import PictureWebp from '../../../components/PictureWebp';
import './PawsPressHomePage.css';

const SUB_CATEGORY_LABEL = {
    pet_photo: 'お写真',
    pet_illust: 'イラスト',
    pet_goods: 'グッズ',
};

// 「これまでの制作」を 写真 → イラスト → グッズ の制作フロー順に見せるグループ定義。
// 各グループの代表画像は portfolioData の isMain フラグ付き1枚を使う（ホームには代表のみ表示）。
const WORKS_GROUPS = [
    {
        key: 'pet_photo',
        step: 'STEP 1',
        title: 'お写真',
        caption: 'お気に入りの一枚を、お送りください。',
    },
    {
        key: 'pet_illust',
        step: 'STEP 2',
        title: 'イラスト',
        caption: '温かみのあるタッチで描き起こします。',
    },
    {
        key: 'pet_goods',
        step: 'STEP 3',
        title: 'グッズ',
        caption: 'Tシャツ・マグ・トートなどに展開できます。',
    },
];

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
                    <PictureWebp
                        src={heroImage}
                        alt="PAWS PRESS のご利用の流れ：1.お気に入りのペット写真を送る 2.プロのイラストレーターが制作 3.最短一週間でお届け 4.世界でひとつだけのうちの子グッズに"
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
                            {plan.badge && (
                                <span
                                    className={`paws-plan-card__badge paws-plan-card__badge--${plan.badgeTone ?? 'pink'}`}
                                >
                                    {plan.badge}
                                </span>
                            )}
                            <h3 className="paws-plan-card__name">{plan.name}</h3>
                            <p className="paws-plan-card__tagline">{plan.tagline}</p>
                            {plan.originalPriceLabel ? (
                                <div className="paws-plan-card__price paws-plan-card__price--sale">
                                    <span className="paws-plan-card__price-original">
                                        {plan.originalPriceLabel}
                                    </span>
                                    <span className="paws-plan-card__price-now">
                                        {plan.saleLabel && (
                                            <span className="paws-plan-card__sale-label">
                                                {plan.saleLabel}
                                            </span>
                                        )}
                                        {plan.priceLabel}
                                    </span>
                                </div>
                            ) : (
                                <div className="paws-plan-card__price">{plan.priceLabel}</div>
                            )}
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
                                このプランで注文する →
                            </Link>
                        </article>
                    ))}
                </div>

                <div className="paws-plans__gift">
                    <span className="paws-plans__gift-icon" aria-hidden="true">🎁</span>
                    <div className="paws-plans__gift-body">
                        <p className="paws-plans__gift-title">
                            ギフトオプション
                            <span className="paws-plans__gift-price">
                                {GIFT_WRAP_OPTION.priceLabel}
                            </span>
                        </p>
                        <p className="paws-plans__gift-text">
                            {GIFT_WRAP_OPTION.label}を承ります。{GIFT_WRAP_OPTION.description}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 「これまでの制作」: 写真→イラスト→グッズの代表1枚ずつを横3カラムで見せる。
// 代表画像をクリックすると PortfolioModal で全作例を順送り閲覧できる。
function WorksSection({ groups, onOpen }) {
    return (
        <section className="paws-flow">
            <div className="paws-flow__inner">
                <h2 className="paws-section-title">これまでの制作</h2>
                <p className="paws-flow__lead">
                    「お写真」一枚が、「イラスト」になり、「グッズ」になるまで。
                </p>
                <div className="paws-flow__steps">
                    {groups.map((group) => (
                        <div key={group.key} className="paws-flow__step">
                            <div className="paws-flow__num">{group.step}</div>
                            <button
                                type="button"
                                className="paws-flow__img"
                                onClick={() =>
                                    group.index >= 0 && onOpen(group.index)
                                }
                                aria-label={`${group.title}の作例を拡大して見る`}
                            >
                                <PictureWebp
                                    src={group.item.image}
                                    alt={group.item.title}
                                    loading="lazy"
                                    onError={onImgError(`works ${group.key}`)}
                                />
                            </button>
                            <h3 className="paws-flow__title">{group.title}</h3>
                            <p className="paws-flow__caption">{group.caption}</p>
                        </div>
                    ))}
                </div>
                <div className="paws-flow__more">
                    <Link to="/pet/gallery" className="paws-btn paws-btn--outline">
                        もっと事例を見る →
                    </Link>
                </div>
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

    // 「これまでの制作」用: 各 subCategory の代表（isMain）1枚と、その petItems 内 index
    const worksGroups = useMemo(
        () =>
            WORKS_GROUPS.map((g) => {
                const item =
                    petItems.find((it) => it.subCategory === g.key && it.isMain) ??
                    petItems.find((it) => it.subCategory === g.key);
                return { ...g, item, index: item ? petItems.indexOf(item) : -1 };
            }).filter((g) => g.item),
        [petItems]
    );

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
            <HeroSection heroImage="/works/pet-hero.jpg" />
            <PlansSection />
            <WorksSection groups={worksGroups} onOpen={setModalIndex} />

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
