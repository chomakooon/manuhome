import { useParams, Link } from 'react-router-dom';
import { portfolioItems, categories } from '../../data/portfolioData';
import './PortfolioSubCategoryPage.css';

export default function PortfolioSubCategoryPage() {
    const { subCategory } = useParams();

    // Find all items belonging to this subCategory
    const galleryItems = portfolioItems.filter(item => item.subCategory === subCategory);

    // Determine the category name from the first item
    const categoryId = galleryItems.length > 0 ? galleryItems[0].category : null;
    const categoryName = categories.find(c => c.id === categoryId)?.name || 'ポートフォリオ';

    // We can also find the 'main' item to get a good title if desired
    const mainItem = galleryItems.find(item => item.isMain) || galleryItems[0];
    const pageTitle = mainItem ? mainItem.title : '関連作品';

    if (galleryItems.length === 0) {
        return (
            <div className="portfolio-subcategory-page section text-center">
                <h2>作品が見つかりませんでした。</h2>
                <Link to="/portfolio" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    ポートフォリオ一覧に戻る
                </Link>
            </div>
        );
    }

    return (
        <div className="portfolio-subcategory-page">
            {/* Header Section */}
            <header className="page-header">
                <div className="container">
                    <h1 className="page-title">{pageTitle}</h1>
                    <p className="page-subtitle">{categoryName}ジャンルの実績一覧</p>
                </div>
            </header>

            {/* Gallery Section */}
            <section className="subcategory-gallery section bg-surface">
                <div className="container">
                    <div className="subcategory-grid">
                        {galleryItems.map((item, index) => (
                            <div key={`sub-${item.id}-${index}`} className="subcategory-card fade-in">
                                <div className="subcategory-card__image">
                                    <img src={item.image} alt={item.title} loading="lazy" />
                                </div>
                                <div className="subcategory-card__content">
                                    <h3 className="subcategory-card__title">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center" style={{ marginTop: '4rem' }}>
                        <Link to="/portfolio" className="btn btn-outline">
                            ポートフォリオ一覧に戻る
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
