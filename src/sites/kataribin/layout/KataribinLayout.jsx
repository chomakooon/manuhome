/**
 * @file src/sites/kataribin/layout/KataribinLayout.jsx
 *
 * カタチ便ブランド用 Layout（Header + main + Footer）。
 * /pet 配下以外のページがこの Layout を順次採用していく予定。
 * 配色・タイポは body.theme-kataribin 配下の CSS 変数に依存。
 */

import KataribinHeader from './KataribinHeader';
import KataribinFooter from './KataribinFooter';
import './KataribinLayout.css';

export default function KataribinLayout({ children }) {
    return (
        <div className="kt-shell">
            <KataribinHeader />
            <main className="kt-main">{children}</main>
            <KataribinFooter />
        </div>
    );
}
