/**
 * @file src/sites/pawspress/pages/PawsPressGuidePage.jsx
 *
 * 「ご利用ガイド」配下 8 ページの暫定プレースホルダ（準備中）。
 * 1 コンポーネントで全ガイドルートを処理し、pathname からタイトルを解決する。
 * 実コンテンツは順次このプレースホルダを差し替えていく。
 */

import { Link, useLocation } from 'react-router-dom';
import PageSeo from '../../../components/PageSeo';
import { findGuideLabel } from '../data/guideLinks';
import './PawsPressGuidePage.css';

export default function PawsPressGuidePage() {
    const { pathname } = useLocation();
    const title = findGuideLabel(pathname);

    return (
        <>
            <PageSeo pageKey="pet" />
            <section className="paws-guide-page">
                <div className="paws-guide-page__inner">
                    <span className="paws-guide-page__eyebrow">ご利用ガイド</span>
                    <h1 className="paws-guide-page__title">{title}</h1>
                    <p className="paws-guide-page__msg">
                        このページはただいま準備中です。<br />
                        公開までもうしばらくお待ちください。
                    </p>
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
            </section>
        </>
    );
}
