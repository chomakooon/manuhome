import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Layers, PawPrint } from 'lucide-react';
import './PortfolioPage.css';
import { portfolioItems, categories } from '../../data/portfolioData';
import Breadcrumb from '../../sites/kataribin/components/Breadcrumb';
import PageSeo from '../../components/PageSeo';
import PictureWebp from '../../components/PictureWebp';

const BREADCRUMB = [
    { label: 'ホーム', to: '/' },
    { label: '制作事例', to: null },
];

const handleImageError = (id) => (e) => {
    console.warn(`[portfolio] image failed to load (id=${id}): ${e.currentTarget.src}`);
};

// Phase 21: role="button" 化した <div> を Enter / Space で発火させるための共通ハンドラ。
const handleActivateKey = (callback) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
    }
};

const PortfolioDetailItem = ({ baseItem, index, allItems, categories }) => {
    const [activeItem, setActiveItem] = useState(baseItem);

    // Get all gallery items for this subcategory
    const galleryItems = allItems.filter(item => item.subCategory === baseItem.subCategory).slice(0, 4);

    return (
        <div
            id={`portfolio-item-${baseItem.id}`}
            className={`portfolio-list-item fade-in ${index % 2 !== 0 ? 'reverse' : ''}`}
        >
            <div className="portfolio-item__image">
                <PictureWebp src={activeItem.image} alt={activeItem.title} loading="lazy" onError={handleImageError(activeItem.id)} />
                <span className="portfolio-item__badge">
                    {categories.find(c => c.id === activeItem.category)?.name}
                </span>
            </div>
            <div className="portfolio-item__content">
                <span className="portfolio-item__category-text">
                    {categories.find(c => c.id === activeItem.category)?.name}
                </span>
                <h3 className="portfolio-item__title">{activeItem.title}</h3>
                <p className="portfolio-item__desc">{activeItem.description}</p>

                {/* Related Works Section */}
                <div className="portfolio-item__related">
                    <h4 className="related-title">関連する他の作品</h4>
                    <div className="related-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {galleryItems.map(item => (
                            <div
                                key={item.id}
                                className={`related-card ${activeItem.id === item.id ? 'active' : ''}`}
                                onClick={() => setActiveItem(item)}
                                onKeyDown={handleActivateKey(() => setActiveItem(item))}
                                role="button"
                                tabIndex={0}
                                style={{ opacity: activeItem.id === item.id ? 0.6 : 1 }}
                            >
                                <div className="related-card__image">
                                    <PictureWebp src={item.image} alt={item.title} loading="lazy" onError={handleImageError(item.id)} />
                                </div>
                                <span className="related-card__title">{item.title}</span>
                            </div>
                        ))}
                    </div>
                    <a
                        href={`/portfolio/${baseItem.subCategory}`}
                        className="btn btn-outline"
                        style={{ marginTop: '1.5rem', display: 'inline-block' }}
                    >
                        {activeItem.title}の実績をもっと見る
                    </a>
                </div>
            </div>
        </div>
    );
};

export default function PortfolioPage() {
    const [searchParams] = useSearchParams();
    // SearchModal などからの `?category=<id>` を初期選択として尊重する
    const initialCategory = (() => {
        const param = searchParams.get('category');
        if (!param) return 'all';
        return categories.some((c) => c.id === param) ? param : 'all';
    })();
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    const filteredItems = (selectedCategory === 'all'
        ? portfolioItems
        : portfolioItems.filter(item => item.category === selectedCategory))
        .filter(item => item.isMain);

    // 各カテゴリの表示件数（isMain ベース）— 「ペット (8)」のような表示用
    const categoryCounts = useMemo(() => {
        const mainItems = portfolioItems.filter(item => item.isMain);
        const counts = { all: mainItems.length };
        for (const cat of categories) {
            if (cat.id === 'all') continue;
            counts[cat.id] = mainItems.filter(i => i.category === cat.id).length;
        }
        return counts;
    }, []);

    // Function to handle smooth scrolling to an item
    const scrollToItem = (id) => {
        const element = document.getElementById(`portfolio-item-${id}`);
        // If element doesn't exist, it means the item might be a dummy non-main item. No-op for now.
        if (element) {
            // Adjust offset for fixed header if present
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="portfolio-page">
            <PageSeo pageKey="portfolio" />
            <Breadcrumb items={BREADCRUMB} />
            {/* Header Section */}
            <header className="page-header">
                <div className="container">
                    <h1 className="page-title">制作事例・ポートフォリオ</h1>
                    <p className="page-subtitle">イラスト・漫画・図解・ブランディングの制作実績をカテゴリー別にご紹介。<br/>あなたの理想のテイストやスタイルが見つかります。</p>
                    <ul className="portfolio-stats">
                        <li className="portfolio-stat">
                            <span className="portfolio-stat__icon" aria-hidden="true">
                                <Sparkles size={20} strokeWidth={1.6} />
                            </span>
                            <span className="portfolio-stat__value">500件＋</span>
                            <span className="portfolio-stat__label">制作実績</span>
                        </li>
                        <li className="portfolio-stat">
                            <span className="portfolio-stat__icon" aria-hidden="true">
                                <Layers size={20} strokeWidth={1.6} />
                            </span>
                            <span className="portfolio-stat__value">{categories.length - 1}</span>
                            <span className="portfolio-stat__label">ジャンル</span>
                        </li>
                        <li className="portfolio-stat">
                            <span className="portfolio-stat__icon" aria-hidden="true">
                                <PawPrint size={20} strokeWidth={1.6} />
                            </span>
                            <span className="portfolio-stat__value">もふらぼ</span>
                            <span className="portfolio-stat__label">ペット専門ブランドも展開</span>
                        </li>
                    </ul>
                </div>
            </header>

            {/* Filter Categories — Phase 11: chip-style with counts, horizontally scrollable on mobile */}
            <section className="portfolio-filter section" aria-label="カテゴリ絞り込み">
                <div className="container">
                    <div className="filter-chips" role="group" aria-label="カテゴリ">
                        {categories.map(cat => {
                            const count = categoryCounts[cat.id] ?? 0;
                            const active = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`filter-chip${active ? ' filter-chip--active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    aria-pressed={active}
                                >
                                    <span className="filter-chip__label">{cat.name}</span>
                                    <span className="filter-chip__count">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Portfolio Grid Navbar (Top) */}
            <section id="portfolio-grid-top" className="portfolio-gallery section pt-0">
                <div className="container">
                    <div className="portfolio-grid">
                        {filteredItems.map(item => (
                            <div
                                key={`nav-${item.id}`}
                                className="portfolio-card fade-in"
                                onClick={() => scrollToItem(item.id)}
                                onKeyDown={handleActivateKey(() => scrollToItem(item.id))}
                                role="button"
                                tabIndex={0}
                                aria-label={`${item.title} の詳細にジャンプ`}
                            >
                                <div className="portfolio-card__image">
                                    <PictureWebp src={item.image} alt={item.title} loading="lazy" onError={handleImageError(item.id)} />
                                    <div className="portfolio-card__overlay">
                                        <span className="portfolio-card__overlay-text">詳細を見る</span>
                                    </div>
                                    <span className="portfolio-card__badge">
                                        {categories.find(c => c.id === item.category)?.name}
                                    </span>
                                </div>
                                <div className="portfolio-card__content">
                                    <h3 className="portfolio-card__title">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* もふらぼ（ペットグッズ）への横断ティザー */}
            <section className="portfolio-cross section">
                <div className="container">
                    <Link to="/pet" className="portfolio-cross__card">
                        <span className="portfolio-cross__icon" aria-hidden="true">
                            <PawPrint size={28} strokeWidth={1.6} />
                        </span>
                        <div className="portfolio-cross__body">
                            <p className="portfolio-cross__title">うちの子のイラスト・グッズが見たい方は</p>
                            <p className="portfolio-cross__sub">ペット専門ブランド「もふらぼ」のページへ</p>
                        </div>
                        <span className="portfolio-cross__arrow" aria-hidden="true">→</span>
                    </Link>
                </div>
            </section>

            {/* Portfolio Detailed List (Bottom) */}
            <section className="portfolio-detailed-list section bg-surface">
                <div className="container">
                    <h2 className="section-title text-center" style={{ marginBottom: '3rem' }}>カテゴリー別 制作実績</h2>
                    <div className="portfolio-list">
                        {filteredItems.map((item, index) => (
                            <PortfolioDetailItem
                                key={`detail-${item.id}`}
                                baseItem={item}
                                index={index}
                                allItems={portfolioItems}
                                categories={categories}
                            />
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="portfolio-cta">
                        <p className="portfolio-cta__text">
                            ここに掲載している以外にも多数の制作実績がございます。<br />
                            「このテイストで制作してほしい」「参考にしたいイメージがある」など、<br />
                            お気軽にご相談ください。初回ヒアリングは無料です。
                        </p>
                        <a href="/intake" className="btn btn-primary">
                            無料で視覚化診断を受ける
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
