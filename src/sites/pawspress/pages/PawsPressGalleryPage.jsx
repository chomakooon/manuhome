/**
 * @file src/sites/pawspress/pages/PawsPressGalleryPage.jsx
 *
 * /pet/gallery: PAWS PRESS の制作事例ページ。
 * pet 配下の portfolioItems を「お写真 / イラスト / グッズ」の3グループに
 * 分けてグリッド表示する。サムネイルをタップで PortfolioModal を開き、
 * グループ横断で前後送りできる。
 *
 * 「もっと事例を見る」のリンク先（旧 /portfolio → カタチラボ側に遷移していた）
 * を PAWS PRESS 内で完結させるための独立ページ。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Brush, ShoppingBag, ArrowLeft } from 'lucide-react';
import { portfolioItems } from '../../../data/portfolioData';
import PortfolioModal from '../../../components/ui/PortfolioModal';
import PageSeo from '../../../components/PageSeo';
import PictureWebp from '../../../components/PictureWebp';
import './PawsPressGalleryPage.css';

const SUB_CATEGORY_LABEL = {
    pet_photo: 'お写真',
    pet_illust: 'イラスト',
    pet_goods: 'グッズ',
};

// 表示順と各グループのメタ（アイコン / STEP / タイトル / リード）
const GROUPS = [
    {
        key: 'pet_photo',
        step: 'STEP 1',
        Icon: Camera,
        title: 'お写真',
        caption: 'お気に入りの一枚をお送りいただきます。',
    },
    {
        key: 'pet_illust',
        step: 'STEP 2',
        Icon: Brush,
        title: 'イラスト',
        caption: '温かみのあるタッチで描き起こします。',
    },
    {
        key: 'pet_goods',
        step: 'STEP 3',
        Icon: ShoppingBag,
        title: 'グッズ',
        caption: 'Tシャツ・マグ・トートなどに展開できます。',
    },
];

const onImgError = (label) => (e) => {
    console.warn(`[paws] ${label} image missing: ${e.currentTarget.src}`);
};

export default function PawsPressGalleryPage() {
    const petItems = useMemo(
        () => portfolioItems.filter((it) => it.category === 'pet'),
        []
    );

    const groups = useMemo(
        () =>
            GROUPS.map((g) => ({
                ...g,
                items: petItems.filter((it) => it.subCategory === g.key),
            })).filter((g) => g.items.length > 0),
        [petItems]
    );

    const [modalIndex, setModalIndex] = useState(-1);
    const isModalOpen = modalIndex >= 0;
    const modalItem = isModalOpen
        ? {
              ...petItems[modalIndex],
              categoryName:
                  SUB_CATEGORY_LABEL[petItems[modalIndex].subCategory] ?? 'PAWS PRESS',
          }
        : null;

    return (
        <>
            <PageSeo pageKey="pet" />

            <nav className="paws-gallery-page__crumbs" aria-label="パンくずリスト">
                <Link to="/pet">PAWS PRESS</Link>
                <span aria-hidden="true">/</span>
                <span className="paws-gallery-page__crumbs-current">制作事例</span>
            </nav>

            <section className="paws-gallery-page__hero">
                <div className="paws-gallery-page__hero-inner">
                    <h1 className="paws-gallery-page__title">制作事例</h1>
                    <p className="paws-gallery-page__lead">
                        「お写真」一枚が、「イラスト」になり、「グッズ」になるまでの実例をご紹介します。
                    </p>
                </div>
            </section>

            <section className="paws-gallery-page__body">
                <div className="paws-gallery-page__inner">
                    {groups.map((group) => (
                        <section
                            key={group.key}
                            className="paws-gallery-page__group"
                            aria-labelledby={`gallery-${group.key}`}
                        >
                            <header className="paws-gallery-page__grouphead">
                                <span className="paws-gallery-page__groupicon">
                                    <group.Icon size={24} aria-hidden="true" />
                                </span>
                                <div>
                                    <span className="paws-gallery-page__groupstep">
                                        {group.step}
                                    </span>
                                    <h2
                                        id={`gallery-${group.key}`}
                                        className="paws-gallery-page__grouptitle"
                                    >
                                        {group.title}
                                    </h2>
                                    <p className="paws-gallery-page__groupcaption">
                                        {group.caption}
                                    </p>
                                </div>
                            </header>

                            <ul className="paws-gallery-page__grid">
                                {group.items.map((item) => (
                                    <li key={item.id} className="paws-gallery-page__cell">
                                        <button
                                            type="button"
                                            className="paws-gallery-page__thumb"
                                            onClick={() =>
                                                setModalIndex(petItems.indexOf(item))
                                            }
                                            aria-label={`${item.title} を拡大して見る`}
                                        >
                                            <PictureWebp
                                                src={item.image}
                                                alt={item.title}
                                                loading="lazy"
                                                onError={onImgError(`gallery (id=${item.id})`)}
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </section>

            <section className="paws-gallery-page__cta">
                <div className="paws-gallery-page__cta-inner">
                    <h2 className="paws-gallery-page__cta-title">
                        うちの子のグッズを作ってみませんか？
                    </h2>
                    <p className="paws-gallery-page__cta-sub">
                        お写真1枚から、世界にひとつだけのグッズをお作りします。
                    </p>
                    <div className="paws-gallery-page__cta-actions">
                        <Link to="/pet/contact" className="paws-btn paws-btn--outline">
                            お問い合わせ
                        </Link>
                        <Link to="/pet/order" className="paws-btn paws-btn--primary">
                            写真を送って注文する →
                        </Link>
                    </div>
                    <Link to="/pet" className="paws-gallery-page__back">
                        <ArrowLeft size={16} aria-hidden="true" />
                        トップへ戻る
                    </Link>
                </div>
            </section>

            <PortfolioModal
                item={modalItem}
                isOpen={isModalOpen}
                onClose={() => setModalIndex(-1)}
                onNext={() =>
                    setModalIndex((i) => Math.min(i + 1, petItems.length - 1))
                }
                onPrev={() => setModalIndex((i) => Math.max(i - 1, 0))}
                hasNext={isModalOpen && modalIndex < petItems.length - 1}
                hasPrev={isModalOpen && modalIndex > 0}
            />
        </>
    );
}
