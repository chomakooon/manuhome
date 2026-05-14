import { Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioItems, categories } from '../../data/portfolioData';
import Breadcrumb from '../../sites/kataribin/components/Breadcrumb';
import PictureWebp from '../../components/PictureWebp';
import { SEO_DEFAULTS } from '../../config/seo.config';
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

    const breadcrumbItems = [
        { label: 'ホーム', to: '/' },
        { label: '制作事例', to: '/portfolio' },
        { label: pageTitle, to: null },
    ];

    const pageSeoTitle = `${pageTitle} | ${categoryName}の制作事例 | カタチ便`;
    const pageSeoDesc = `${categoryName}ジャンルの制作事例「${pageTitle}」を含む実績一覧。カタチ便（${SEO_DEFAULTS.author}）の作品をご覧いただけます。`;
    const canonical = `${SEO_DEFAULTS.siteUrl}/portfolio/${subCategory}`;
    const ogImage = `${SEO_DEFAULTS.siteUrl}${SEO_DEFAULTS.defaultOgImage}`;

    return (
        <div className="portfolio-subcategory-page">
            {/* 動的タイトル: PAGE_SEO に固定キーがないため、ここで直接ホイストする */}
            <Fragment>
                <title>{pageSeoTitle}</title>
                <meta name="description" content={pageSeoDesc} />
                <link rel="canonical" href={canonical} />
                <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={pageSeoTitle} />
                <meta property="og:description" content={pageSeoDesc} />
                <meta property="og:url" content={canonical} />
                <meta property="og:image" content={ogImage} />
                <meta name="twitter:card" content={SEO_DEFAULTS.twitterCard} />
                <meta name="twitter:title" content={pageSeoTitle} />
                <meta name="twitter:description" content={pageSeoDesc} />
                <meta name="twitter:image" content={ogImage} />
            </Fragment>
            <Breadcrumb items={breadcrumbItems} />
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
                                    <PictureWebp
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        onError={(e) => console.warn(`[portfolio] image failed to load (id=${item.id}): ${e.currentTarget.src}`)}
                                    />
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
