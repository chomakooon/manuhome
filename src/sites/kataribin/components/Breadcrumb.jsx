/**
 * @file src/sites/kataribin/components/Breadcrumb.jsx
 *
 * Findability 用パンくずリスト（Phase 11）。
 *
 * 使い方:
 *   <Breadcrumb items={[
 *     { label: 'ホーム', to: '/' },
 *     { label: '制作事例', to: '/portfolio' },
 *     { label: 'ペット写真', to: null },  // 最後（現在地）は to: null
 *   ]} />
 */

import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

/**
 * @param {{ items: { label: string, to: string | null }[] }} props
 */
export default function Breadcrumb({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <nav className="kt-breadcrumb" aria-label="パンくずリスト">
            <ol className="kt-breadcrumb__list">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    return (
                        <Fragment key={`${item.label}-${idx}`}>
                            <li className="kt-breadcrumb__item">
                                {item.to && !isLast ? (
                                    <Link to={item.to} className="kt-breadcrumb__link">
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span
                                        className="kt-breadcrumb__current"
                                        aria-current={isLast ? 'page' : undefined}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </li>
                            {!isLast && (
                                <li
                                    className="kt-breadcrumb__sep"
                                    aria-hidden="true"
                                >
                                    /
                                </li>
                            )}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
