/**
 * @file src/sites/pawspress/pages/PawsPressGuidePage.jsx
 *
 * 「ご利用ガイド」配下 8 ページの汎用レンダラ。
 * 1 コンポーネントで全ガイドルートを処理し、pathname から
 * タイトル（guideLinks）とコンテンツ（guideContent）を解決して、
 * 共通chrome（パンくず / ヒーロー / 関連ページ / 末尾CTA）とブロックを描画する。
 *
 * ★ ENGINEER CONNECTION POINT ★
 *   コンテンツは guideContent.js / config の静的モック。
 *   実運用では CMS / API / 設定から取得する形に差し替える（詳細は guideContent.js 参照）。
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Truck,
    Camera,
    CheckCircle,
    Edit3,
    CreditCard,
    Package,
    HelpCircle,
    Building2,
    Clock,
    ShoppingBag,
    Brush,
    MessageCircle,
    Sun,
    Focus,
    Maximize,
    Heart,
    XCircle,
    Info,
    Sparkles,
} from 'lucide-react';
import PageSeo from '../../../components/PageSeo';
import PictureWebp from '../../../components/PictureWebp';
import PictureWebpWithFallback from '../../../components/PictureWebpWithFallback';
import { findGuideLabel } from '../data/guideLinks';
import { getGuideContent } from '../data/guideContent';
import './PawsPressGuidePage.css';

const ICON_MAP = {
    Truck,
    Camera,
    CheckCircle,
    Edit3,
    CreditCard,
    Package,
    HelpCircle,
    Building2,
    Clock,
    ShoppingBag,
    Brush,
    MessageCircle,
    Sun,
    Focus,
    Maximize,
    Heart,
    XCircle,
    Info,
    Sparkles,
};

function Icon({ name, size = 24, className }) {
    const Cmp = ICON_MAP[name] ?? Sparkles;
    return <Cmp size={size} className={className} aria-hidden="true" />;
}

function HeroVisual({ heroImage, iconName, title }) {
    const [imgError, setImgError] = useState(false);
    if (heroImage && !imgError) {
        return (
            <div className="paws-guide-hero__media">
                <PictureWebp
                    src={heroImage}
                    alt={title}
                    loading="eager"
                    onError={() => setImgError(true)}
                />
            </div>
        );
    }
    return (
        <div className="paws-guide-hero__iconwrap" aria-hidden="true">
            <Icon name={iconName} size={96} className="paws-guide-hero__icon" />
        </div>
    );
}

function Block({ block }) {
    switch (block.kind) {
        case 'summary':
            return (
                <div className="paws-guide-summary">
                    <Icon name={block.iconName} size={32} className="paws-guide-summary__icon" />
                    <div>
                        <p className="paws-guide-summary__label">{block.label}</p>
                        <p className="paws-guide-summary__value">{block.value}</p>
                        {block.sub && <p className="paws-guide-summary__sub">{block.sub}</p>}
                    </div>
                </div>
            );

        case 'timeline':
            return (
                <ol className="paws-guide-timeline">
                    {block.items.map((s) => (
                        <li key={s.number} className="paws-guide-timeline__item">
                            <span className="paws-guide-timeline__badge">{s.number}</span>
                            <div className="paws-guide-timeline__card">
                                <div className="paws-guide-timeline__cardicon">
                                    <Icon name={s.iconName} size={24} />
                                </div>
                                <div className="paws-guide-timeline__body">
                                    <div className="paws-guide-timeline__head">
                                        <h3 className="paws-guide-timeline__title">{s.title}</h3>
                                        <span className="paws-guide-timeline__duration">
                                            目安 {s.duration}
                                        </span>
                                    </div>
                                    <p className="paws-guide-timeline__desc">{s.description}</p>
                                    {s.tip && (
                                        <p className="paws-guide-timeline__tip">
                                            <Info size={14} aria-hidden="true" />
                                            {s.tipLink ? (
                                                <Link to={s.tipLink}>{s.tip} →</Link>
                                            ) : (
                                                <span>{s.tip}</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            );

        case 'banner':
            return (
                <div className="paws-guide-banner">
                    <Icon name={block.iconName} size={48} className="paws-guide-banner__icon" />
                    <h3 className="paws-guide-banner__title">{block.title}</h3>
                    <p className="paws-guide-banner__text">{block.text}</p>
                    <a className="paws-guide-banner__btn" href={block.buttonHref}>
                        {block.buttonLabel}
                    </a>
                    {block.note && <p className="paws-guide-banner__note">{block.note}</p>}
                </div>
            );

        case 'cards':
            return (
                <div className="paws-guide-cards">
                    {block.items.map((c) => (
                        <div key={c.title} className="paws-guide-card">
                            <div
                                className={`paws-guide-card__icon paws-guide-card__icon--${block.tone ?? 'good'}`}
                            >
                                <Icon name={c.iconName} size={28} />
                            </div>
                            <h3 className="paws-guide-card__title">{c.title}</h3>
                            <p className="paws-guide-card__desc">{c.description}</p>
                        </div>
                    ))}
                </div>
            );

        case 'examples':
            return (
                <div className="paws-guide-examples">
                    <div className="paws-guide-examples__head">
                        <Icon
                            name={block.headingIcon}
                            size={26}
                            className={`paws-guide-examples__headicon paws-guide-examples__headicon--${block.tone}`}
                        />
                        <h2 className="paws-guide-examples__heading">{block.heading}</h2>
                    </div>
                    <div className="paws-guide-examples__grid">
                        {block.items.map((ex) => (
                            <div
                                key={ex.src}
                                className={`paws-guide-example paws-guide-example--${block.tone}`}
                            >
                                <div className="paws-guide-example__imgwrap">
                                    <PictureWebpWithFallback
                                        src={ex.src}
                                        alt={ex.caption}
                                        placeholderText="サンプル画像準備中"
                                        className="paws-guide-example__img"
                                    />
                                    <span
                                        className={`paws-guide-example__badge paws-guide-example__badge--${block.tone}`}
                                    >
                                        {block.badge}
                                    </span>
                                </div>
                                <div className="paws-guide-example__caption">
                                    <p className="paws-guide-example__title">{ex.caption}</p>
                                    <p className="paws-guide-example__sub">{ex.subCaption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'reassurance':
            return (
                <div className="paws-guide-reassurance">
                    <Icon
                        name={block.iconName}
                        size={40}
                        className="paws-guide-reassurance__icon"
                    />
                    <div>
                        <h3 className="paws-guide-reassurance__heading">{block.heading}</h3>
                        {block.paragraphs.map((p, i) => (
                            <p key={i} className="paws-guide-reassurance__p">
                                {p}
                            </p>
                        ))}
                    </div>
                </div>
            );

        case 'spectable':
            return (
                <div className="paws-guide-spec">
                    {block.heading && (
                        <h3 className="paws-guide-page__heading">{block.heading}</h3>
                    )}
                    <table className="paws-guide-spec__table">
                        <tbody>
                            {block.rows.map((r) => (
                                <tr key={r.label}>
                                    <th scope="row">{r.label}</th>
                                    <td>{r.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case 'list':
            return (
                <div className="paws-guide-page__listblock">
                    {block.heading && (
                        <h3 className="paws-guide-page__heading">{block.heading}</h3>
                    )}
                    <ul className="paws-guide-page__list">
                        {block.items.map((it) => (
                            <li key={it}>{it}</li>
                        ))}
                    </ul>
                </div>
            );

        case 'table':
            return (
                <table className="paws-guide-page__table">
                    <thead>
                        <tr>
                            {block.columns.map((c) => (
                                <th key={c}>{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {block.rows.map((row) => (
                            <tr key={row[0]}>
                                {row.map((cell, ci) => (
                                    <td key={ci}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

        case 'faq':
            return (
                <div className="paws-guide-page__faq">
                    {block.items.map((f) => (
                        <details key={f.q} className="paws-guide-page__faq-item">
                            <summary className="paws-guide-page__faq-q">{f.q}</summary>
                            <p className="paws-guide-page__faq-a">{f.a}</p>
                        </details>
                    ))}
                </div>
            );

        case 'prose':
            return (
                <div className="paws-guide-page__prose">
                    {block.heading && (
                        <h3 className="paws-guide-page__heading">{block.heading}</h3>
                    )}
                    {block.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            );

        case 'note':
            return <p className="paws-guide-page__note">{block.text}</p>;

        default:
            return null;
    }
}

export default function PawsPressGuidePage() {
    const { pathname } = useLocation();
    const title = findGuideLabel(pathname);
    const content = getGuideContent(pathname);

    return (
        <>
            <PageSeo pageKey="pet" />

            <nav className="paws-guide-crumbs" aria-label="パンくずリスト">
                <Link to="/pet">PAWS PRESS</Link>
                <span aria-hidden="true">/</span>
                <span>ご利用ガイド</span>
                <span aria-hidden="true">/</span>
                <span className="paws-guide-crumbs__current">{title}</span>
            </nav>

            <section className="paws-guide-hero">
                <div className="paws-guide-hero__inner">
                    <div className="paws-guide-hero__text">
                        <span className="paws-guide-hero__eyebrow">ご利用ガイド</span>
                        <h1 className="paws-guide-hero__title">{title}</h1>
                        {content?.lead && (
                            <p className="paws-guide-hero__lead">{content.lead}</p>
                        )}
                    </div>
                    <HeroVisual
                        heroImage={content?.heroImage}
                        iconName={content?.iconName}
                        title={title}
                    />
                </div>
            </section>

            <section className="paws-guide-body">
                <div className="paws-guide-body__inner">
                    {content ? (
                        content.blocks.map((block, i) => <Block key={i} block={block} />)
                    ) : (
                        <p className="paws-guide-page__note">
                            このページはただいま準備中です。
                        </p>
                    )}
                </div>
            </section>

            {content?.related?.length > 0 && (
                <section className="paws-guide-related">
                    <div className="paws-guide-related__inner">
                        <h2 className="paws-guide-related__title">関連ページ</h2>
                        <div className="paws-guide-related__grid">
                            {content.related.map((r) => (
                                <Link
                                    key={r.to}
                                    to={r.to}
                                    className="paws-guide-related__card"
                                >
                                    <span className="paws-guide-related__cardicon">
                                        <Icon name={r.iconName} size={24} />
                                    </span>
                                    <span className="paws-guide-related__cardtitle">
                                        {findGuideLabel(r.to)}
                                    </span>
                                    <span className="paws-guide-related__arrow" aria-hidden="true">
                                        →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="paws-guide-cta">
                <div className="paws-guide-cta__inner">
                    <h2 className="paws-guide-cta__title">まだ疑問がありますか？</h2>
                    <p className="paws-guide-cta__sub">お気軽にお問い合わせください。</p>
                    <div className="paws-guide-cta__actions">
                        <Link to="/pet/contact" className="paws-btn paws-btn--outline">
                            お問い合わせ →
                        </Link>
                        <Link to="/pet/order" className="paws-btn paws-btn--primary">
                            写真を送って注文する →
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
