/**
 * @file src/sites/pawspress/pages/PawsPressGuidePage.jsx
 *
 * 「ご利用ガイド」配下 8 ページのモック実装。
 * 1 コンポーネントで全ガイドルートを処理し、pathname から
 * タイトル（guideLinks）とコンテンツ（guideContent）を解決して描画する。
 *
 * ★ ENGINEER CONNECTION POINT ★
 *   コンテンツは guideContent.js の静的モック。
 *   実運用では CMS / API / 設定から取得する形に差し替える（詳細は guideContent.js 参照）。
 */

import { Link, useLocation } from 'react-router-dom';
import PageSeo from '../../../components/PageSeo';
import { findGuideLabel } from '../data/guideLinks';
import { getGuideContent } from '../data/guideContent';
import './PawsPressGuidePage.css';

function Block({ block }) {
    switch (block.kind) {
        case 'steps':
            return (
                <ol className="paws-guide-page__steps">
                    {block.items.map((s, i) => (
                        <li key={s.title} className="paws-guide-page__step">
                            <span className="paws-guide-page__step-num">{i + 1}</span>
                            <div>
                                <h3 className="paws-guide-page__step-title">{s.title}</h3>
                                <p className="paws-guide-page__step-desc">{s.desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            );

        case 'dosdonts':
            return (
                <div className="paws-guide-page__dosdonts">
                    <div className="paws-guide-page__do">
                        <h3 className="paws-guide-page__do-head">◎ おすすめ</h3>
                        <ul>
                            {block.dos.map((d) => (
                                <li key={d}>{d}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="paws-guide-page__dont">
                        <h3 className="paws-guide-page__dont-head">△ 避けたい例</h3>
                        <ul>
                            {block.donts.map((d) => (
                                <li key={d}>{d}</li>
                            ))}
                        </ul>
                    </div>
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
            <article className="paws-guide-page">
                <div className="paws-guide-page__inner">
                    <span className="paws-guide-page__eyebrow">ご利用ガイド</span>
                    <h1 className="paws-guide-page__title">{title}</h1>

                    {content ? (
                        <>
                            {content.lead && (
                                <p className="paws-guide-page__lead">{content.lead}</p>
                            )}
                            <div className="paws-guide-page__body">
                                {content.blocks.map((block, i) => (
                                    <Block key={i} block={block} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="paws-guide-page__lead">
                            このページはただいま準備中です。
                        </p>
                    )}

                    <div className="paws-guide-page__actions">
                        <Link
                            to="/pet/order"
                            className="paws-btn paws-btn--primary paws-btn--lg"
                        >
                            写真を送って注文する →
                        </Link>
                        <Link to="/pet/contact" className="paws-btn paws-btn--outline">
                            お問い合わせ
                        </Link>
                    </div>
                    <Link to="/pet" className="paws-guide-page__back">
                        ← トップへ戻る
                    </Link>
                </div>
            </article>
        </>
    );
}
