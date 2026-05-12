/**
 * @file src/sites/kataribin/layout/KataribinLayout.jsx
 *
 * カタチ便ブランド用 Layout（Header + main + Footer）。
 * /pet 配下以外のページがこの Layout を順次採用していく予定。
 * 配色・タイポは body.theme-kataribin 配下の CSS 変数に依存。
 */

import { useLocation } from 'react-router-dom';
import KataribinHeader from './KataribinHeader';
import KataribinFooter from './KataribinFooter';
import './KataribinLayout.css';

export default function KataribinLayout({ children }) {
    // Phase 14: ページ遷移時のフェードイン。
    // key を pathname に紐付け、CSS `animation: ktFadeInPage` を毎回トリガする。
    const { pathname } = useLocation();
    return (
        <div className="kt-shell">
            <a href="#main-content" className="skip-link">
                メインコンテンツへスキップ
            </a>
            <KataribinHeader />
            <main id="main-content" className="kt-main" tabIndex={-1}>
                <div key={pathname} className="kt-page-fade">
                    {children}
                </div>
            </main>
            <KataribinFooter />
        </div>
    );
}
