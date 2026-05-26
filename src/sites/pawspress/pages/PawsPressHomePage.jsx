/**
 * @file src/sites/pawspress/pages/PawsPressHomePage.jsx
 *
 * PAWS PRESS のトップ LP。下記の順で 1 ページで完結するスクロールLP。
 *  1. ヒーロー
 *  2. 共感（こんなお悩み, id="concerns"）
 *  3. 特徴・選ばれる理由（id="strengths"）
 *  4. 制作事例（id="works"）+ PortfolioModal
 *  5. ご利用の流れ 抜粋（id="flow" → 詳細は /pet/guide/order-flow）
 *  6. お客様の声（id="voices"）
 *  7. プラン（id="plans" — ナビ '/pet#plans' のスクロール先）
 *  8. よくある質問 抜粋（id="faq" → /pet/faq）
 *  9. 最終CTA
 *
 * 画風選択（キャラクター調メイン / 実写風 選択可）は注文フォーム Step 1 に配置。
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Heart,
    Sparkles,
    Gift,
    Brush,
    Package,
    RefreshCw,
    Building2,
    Camera,
    Send,
    CheckCircle,
    Truck,
    Star,
    HelpCircle,
} from 'lucide-react';
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

// ── LP セクション用コンテンツ定義（モック。実運用ではCMS等から取得） ─────

// 共感パート: お悩み 3 つ
const CONCERNS = [
    { Icon: Heart, title: 'うちの子の今を、形に残したい', desc: 'かわいい瞬間を、いつでも見える場所に置いておきたい。' },
    { Icon: Sparkles, title: '普通のグッズでは、物足りない', desc: '世界にひとつだけの、特別な記念品にしたい。' },
    { Icon: Gift, title: '大切な家族への贈り物に困っている', desc: 'ありきたりじゃない、心に残るプレゼントを探している。' },
];

// 特徴: PAWS PRESS が選ばれる 4 つの理由
const STRENGTHS = [
    { Icon: Brush, title: 'プロイラストレーターの手描き', desc: '岡崎真奈による、温かみのあるオリジナルタッチ。' },
    { Icon: Package, title: '写真1枚から世界にひとつ', desc: 'お気に入りの1枚をお送りいただくだけ。あとはお任せください。' },
    { Icon: RefreshCw, title: '安心の修正対応', desc: 'デザイン確認の段階で、ご満足いただけるまで丁寧に。' },
    { Icon: Building2, title: '法人・大量注文OK', desc: '動物病院・保護団体・ノベルティの実績多数。' },
];

// ご利用の流れ（短縮版）。詳細は /pet/guide/order-flow。
const FLOW_PREVIEW = [
    { Icon: Camera, title: 'お写真を送る', desc: 'お気に入りの1枚をフォームから送信' },
    { Icon: Brush, title: 'イラスト制作', desc: '心を込めて手描きで制作' },
    { Icon: CheckCircle, title: 'デザイン確認', desc: 'メール/LINEで完成イメージをご確認' },
    { Icon: Truck, title: 'グッズお届け', desc: '確定後、最短一週間で全国へ' },
];

// ★ ENGINEER CONNECTION POINT ★
// お客様の声はモック。実運用ではCMS / Google レビュー等から取得する想定。
const VOICES = [
    {
        quote: 'うちの子そっくりに描いていただき、家族みんなで感動しました。Tシャツの仕上がりも丁寧で大満足です。',
        author: 'M.S 様',
        sub: 'トイプードル モカちゃん',
    },
    {
        quote: '母の誕生日プレゼントに、亡くなったうちの子のイラスト入りマグカップを注文。涙が止まらないと喜んでくれました。',
        author: 'K.T 様',
        sub: 'ミニチュアダックスフンド ココちゃん',
    },
    {
        quote: '動物病院のノベルティとして50個発注しました。患者さまにも好評で、リピートでお願いする予定です。',
        author: '都内動物病院 H様',
        sub: '法人ご注文',
    },
];

// FAQ 抜粋（フルは /pet/faq）
const FAQ_PREVIEW = [
    {
        q: 'どんな写真でも依頼できますか？',
        a: '明るくピントが合った写真であれば、スマホ撮影でも問題ありません。詳しくは「お写真の選び方」をご覧ください。',
    },
    {
        q: '制作にどれくらいかかりますか？',
        a: 'プランによって異なりますが、デザイン確定後、最短7日でお届けします。',
    },
    {
        q: '修正は何回まで可能ですか？',
        a: 'プランごとに無料修正回数を設けています。詳しくは「修正対応について」をご覧ください。',
    },
];

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
                            {plan.image && (
                                <div className="paws-plan-card__image">
                                    <PictureWebp
                                        src={plan.image}
                                        alt={plan.imageAlt ?? plan.name}
                                        loading="lazy"
                                        onError={(e) => {
                                            console.warn(
                                                `[paws] plan image missing: ${e.currentTarget.src}`
                                            );
                                        }}
                                    />
                                </div>
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

// ── LP: 共感（お悩み） ───────────────────────────────
function ConcernsSection() {
    return (
        <section className="paws-concerns" id="concerns" aria-labelledby="concerns-title">
            <div className="paws-concerns__inner">
                <h2 id="concerns-title" className="paws-section-title">
                    こんなお悩み、ありませんか？
                </h2>
                <p className="paws-section-lead">
                    ひとつでも当てはまる方は、PAWS PRESS にお任せください。
                </p>
                <ul className="paws-concerns__grid">
                    {CONCERNS.map((c) => (
                        <li key={c.title} className="paws-concerns__card">
                            <span className="paws-concerns__icon" aria-hidden="true">
                                <c.Icon size={28} />
                            </span>
                            <h3 className="paws-concerns__title">{c.title}</h3>
                            <p className="paws-concerns__desc">{c.desc}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// ── LP: 特徴・選ばれる理由 ──────────────────────────
function StrengthsSection() {
    return (
        <section className="paws-strengths" id="strengths" aria-labelledby="strengths-title">
            <div className="paws-strengths__inner">
                <h2 id="strengths-title" className="paws-section-title">
                    PAWS PRESS が選ばれる理由
                </h2>
                <p className="paws-section-lead">
                    写真1枚から、想いまで届くグッズを。
                </p>
                <ul className="paws-strengths__grid">
                    {STRENGTHS.map((s) => (
                        <li key={s.title} className="paws-strengths__card">
                            <span className="paws-strengths__icon" aria-hidden="true">
                                <s.Icon size={26} />
                            </span>
                            <h3 className="paws-strengths__title">{s.title}</h3>
                            <p className="paws-strengths__desc">{s.desc}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// ── LP: ご利用の流れ（抜粋） ────────────────────────
function FlowPreviewSection() {
    return (
        <section className="paws-flowprev" id="flow" aria-labelledby="flow-title">
            <div className="paws-flowprev__inner">
                <h2 id="flow-title" className="paws-section-title">
                    ご利用の流れ
                </h2>
                <p className="paws-section-lead">
                    写真を送るだけ。あとはプロにおまかせください。
                </p>
                <ol className="paws-flowprev__steps">
                    {FLOW_PREVIEW.map((s, i) => (
                        <li key={s.title} className="paws-flowprev__step">
                            <span className="paws-flowprev__num">{i + 1}</span>
                            <span className="paws-flowprev__icon" aria-hidden="true">
                                <s.Icon size={22} />
                            </span>
                            <span className="paws-flowprev__title">{s.title}</span>
                            <span className="paws-flowprev__desc">{s.desc}</span>
                        </li>
                    ))}
                </ol>
                <div className="paws-flowprev__more">
                    <Link
                        to="/pet/guide/order-flow"
                        className="paws-btn paws-btn--outline"
                    >
                        詳しい流れを見る →
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ── LP: お客様の声 ──────────────────────────────────
function VoicesSection() {
    return (
        <section className="paws-voices" id="voices" aria-labelledby="voices-title">
            <div className="paws-voices__inner">
                <h2 id="voices-title" className="paws-section-title">
                    お客様の声
                </h2>
                <p className="paws-section-lead">
                    実際にご利用いただいた皆様からのコメントです。
                </p>
                <ul className="paws-voices__grid">
                    {VOICES.map((v) => (
                        <li key={v.author} className="paws-voices__card">
                            <span
                                className="paws-voices__stars"
                                aria-label="評価: 星5つ"
                            >
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill="#F5B400"
                                        strokeWidth={0}
                                        aria-hidden="true"
                                    />
                                ))}
                            </span>
                            <p className="paws-voices__quote">「{v.quote}」</p>
                            <p className="paws-voices__author">
                                {v.author}
                                <span className="paws-voices__sub"> / {v.sub}</span>
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

// ── LP: よくある質問（抜粋） ──────────────────────
function FaqPreviewSection() {
    return (
        <section className="paws-faqprev" id="faq" aria-labelledby="faq-title">
            <div className="paws-faqprev__inner">
                <h2 id="faq-title" className="paws-section-title">
                    よくある質問
                </h2>
                <p className="paws-section-lead">
                    お申し込み前によくいただくご質問をご紹介します。
                </p>
                <div className="paws-faqprev__list">
                    {FAQ_PREVIEW.map((f) => (
                        <details key={f.q} className="paws-faqprev__item">
                            <summary className="paws-faqprev__q">
                                <HelpCircle size={18} aria-hidden="true" />
                                {f.q}
                            </summary>
                            <p className="paws-faqprev__a">{f.a}</p>
                        </details>
                    ))}
                </div>
                <div className="paws-faqprev__more">
                    <Link to="/pet/faq" className="paws-btn paws-btn--outline">
                        すべての質問を見る →
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ── LP: 最終CTA ────────────────────────────────────
function FinalCtaSection() {
    return (
        <section className="paws-finalcta" aria-labelledby="finalcta-title">
            <div className="paws-finalcta__inner">
                <h2 id="finalcta-title" className="paws-finalcta__title">
                    うちの子を、世界にひとつのグッズに。
                </h2>
                <p className="paws-finalcta__sub">
                    写真1枚から、最短7日。全国送料無料でお届けします。
                </p>
                <div className="paws-finalcta__actions">
                    <Link
                        to="/pet/contact"
                        className="paws-btn paws-btn--outline paws-btn--lg"
                    >
                        まずは相談する
                    </Link>
                    <Link
                        to="/pet/order"
                        className="paws-btn paws-btn--primary paws-btn--lg"
                    >
                        写真を送って注文する →
                    </Link>
                </div>
                <p className="paws-finalcta__note">平日対応・全国送料無料</p>
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
            <ConcernsSection />
            <StrengthsSection />
            <WorksSection groups={worksGroups} onOpen={setModalIndex} />
            <FlowPreviewSection />
            <VoicesSection />
            <PlansSection />
            <FaqPreviewSection />
            <FinalCtaSection />

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
