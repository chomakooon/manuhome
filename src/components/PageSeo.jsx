/**
 * @file src/components/PageSeo.jsx
 *
 * ページ単位の SEO / OGP / Twitter Card / 構造化データを宣言的に注入する
 * 共通コンポーネント（Phase 15）。
 *
 * React 19 のネイティブ「Document Metadata」機能を利用しており、
 * 子コンポーネントとして直接 <title> / <meta> / <link> / <script> を
 * 返すだけで <head> に自動ホイストされる。
 * （react-helmet-async などの追加ライブラリは不要）
 *
 * 使い方:
 *   <PageSeo pageKey="pricing" />
 *
 *   // 追加の JSON-LD を埋め込みたいページ:
 *   <PageSeo pageKey="about" extraJsonLd={[personLd]} />
 */

import { Fragment } from 'react';
import { PAGE_SEO, SEO_DEFAULTS } from '../config/seo.config';

const absoluteUrl = (path) => {
    if (!path) return SEO_DEFAULTS.siteUrl;
    if (path.startsWith('http')) return path;
    const sep = path.startsWith('/') ? '' : '/';
    return `${SEO_DEFAULTS.siteUrl}${sep}${path}`;
};

/**
 * @param {{
 *   pageKey: keyof typeof PAGE_SEO,
 *   extraJsonLd?: object[],
 * }} props
 */
export default function PageSeo({ pageKey, extraJsonLd = [] }) {
    const page = PAGE_SEO[pageKey];
    if (!page) {
        console.warn(`[PageSeo] unknown pageKey: ${pageKey}`);
        return null;
    }

    const title = page.title;
    const description = page.description || SEO_DEFAULTS.defaultDescription;
    const ogImage = absoluteUrl(page.ogImage || SEO_DEFAULTS.defaultOgImage);
    const url = absoluteUrl(page.path);
    const ogType = page.ogType || 'website';

    return (
        <Fragment>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:site_name" content={SEO_DEFAULTS.siteName} />
            <meta property="og:locale" content={SEO_DEFAULTS.locale} />
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter Card */}
            <meta name="twitter:card" content={SEO_DEFAULTS.twitterCard} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            {SEO_DEFAULTS.twitterHandle && (
                <meta name="twitter:site" content={SEO_DEFAULTS.twitterHandle} />
            )}

            {/* 追加 JSON-LD（Person / Service 等） */}
            {extraJsonLd.map((ld, idx) => (
                <script
                    key={`ld-${idx}`}
                    type="application/ld+json"
                >
                    {JSON.stringify(ld)}
                </script>
            ))}
        </Fragment>
    );
}
