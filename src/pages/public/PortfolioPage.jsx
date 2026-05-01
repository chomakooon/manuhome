import { useState } from 'react';
import './PortfolioPage.css';
import { portfolioItems, categories } from '../../data/portfolioData';

const PortfolioDetailItem = ({ baseItem, index, allItems, categories, onSeeMore }) => {
    const [activeItem, setActiveItem] = useState(baseItem);

    // Get all gallery items for this subcategory
    const galleryItems = allItems.filter(item => item.subCategory === baseItem.subCategory).slice(0, 4);

    return (
        <div
            id={`portfolio-item-${baseItem.id}`}
            className={`portfolio-list-item fade-in ${index % 2 !== 0 ? 'reverse' : ''}`}
        >
            <div className="portfolio-item__image">
                <img src={activeItem.image} alt={activeItem.title} loading="lazy" />
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
                                role="button"
                                tabIndex={0}
                                style={{ opacity: activeItem.id === item.id ? 0.6 : 1 }}
                            >
                                <div className="related-card__image">
                                    <img src={item.image} alt={item.title} loading="lazy" />
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
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredItems = (selectedCategory === 'all'
        ? portfolioItems
        : portfolioItems.filter(item => item.category === selectedCategory))
        .filter(item => item.isMain);

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
            {/* Header Section */}
            <header className="page-header">
                <div className="container">
                    <h1 className="page-title">制作事例・ポートフォリオ</h1>
                    <p className="page-subtitle">イラスト・漫画・図解・ブランディングの制作実績をカテゴリー別にご紹介。<br/>あなたの理想のテイストやスタイルが見つかります。</p>
                </div>
            </header>

            {/* Filter Categories */}
            <section className="portfolio-filter section">
                <div className="container">
                    <div className="filter-buttons">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
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
                            >
                                <div className="portfolio-card__image">
                                    <img src={item.image} alt={item.title} loading="lazy" />
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
