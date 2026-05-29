/**
 * @file src/sites/kataribin/components/SearchModal.jsx
 *
 * Findability 用「ナビ的検索」モーダル（Phase 11 / 実装案A）。
 * フル検索エンジンは Phase 11.5 以降に保留。
 *
 * 動作仕様:
 *   - props.open=true で表示
 *   - 主要ページ + ポートフォリオカテゴリへのクイックリンク
 *   - ESC キー / 背景クリック / 閉じるボタンで close
 *   - 開いている間は body スクロールをロック
 *   - リンクをクリックすると onClose を呼んで遷移後の重なりを防ぐ
 *   - Phase 17: focus-trap-react で Tab/Shift+Tab がモーダル内で循環するよう拘束
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FocusTrap } from 'focus-trap-react';
import { X, Search as SearchIcon } from 'lucide-react';
import { worksCategories } from '../../../config/works/categories';
import './SearchModal.css';

const QUICK_LINKS = [
    { label: '料金プラン', to: '/pricing' },
    { label: '制作の流れ', to: '/flow' },
    { label: '制作事例', to: '/portfolio' },
    { label: 'ビジュアル診断', to: '/diagnostic' },
    { label: 'カタチらぼについて', to: '/about' },
    { label: 'SNS・リンク', to: '/links' },
    { label: 'お問い合わせ', to: '/contact' },
    { label: 'もふらぼ（ペット）', to: '/pet' },
];

/**
 * @param {{ open: boolean, onClose: () => void }} props
 */
export default function SearchModal({ open, onClose }) {
    const closeBtnRef = useRef(null);

    // Phase 17 以降: ESC は focus-trap の escapeDeactivates に一本化したため、
    // ここでは body スクロールロック + 初期フォーカス（閉じるボタン）のみ担当する。
    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        // Phase 13: 開いた直後に閉じるボタンへフォーカスを移し、
        // キーボードのみのユーザーが ESC で抜けられることを明示する。
        closeBtnRef.current?.focus();
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    if (!open) return null;

    const sortedCategories = [...worksCategories].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

    return (
        <FocusTrap
            active={open}
            focusTrapOptions={{
                // 既存の closeBtnRef.focus() を尊重するため自前初期フォーカスは無効化
                initialFocus: false,
                // ESC で trap を解除 → onDeactivate へ → onClose 呼び出し
                escapeDeactivates: true,
                // 背景クリックで trap 解除（手動で onClose も呼んでいるので二重安全網）
                clickOutsideDeactivates: true,
                onDeactivate: onClose,
                // モーダルが閉じてアンマウントされる際に直前要素へフォーカスを戻す
                returnFocusOnDeactivate: true,
            }}
        >
        <div
            className="kt-search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="サイト内クイックナビゲーション"
        >
            <button
                type="button"
                className="kt-search-modal__backdrop"
                onClick={onClose}
                aria-label="閉じる"
            />
            <div className="kt-search-modal__panel" role="document">
                <header className="kt-search-modal__header">
                    <span className="kt-search-modal__title">
                        <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
                        サイト内を探す
                    </span>
                    <button
                        ref={closeBtnRef}
                        type="button"
                        className="kt-search-modal__close"
                        onClick={onClose}
                        aria-label="検索を閉じる"
                    >
                        <X size={20} strokeWidth={2} aria-hidden="true" />
                    </button>
                </header>

                <p className="kt-search-modal__hint">
                    キーワード検索は準備中です。よく見られるページからお選びください。
                </p>

                <section className="kt-search-modal__section">
                    <h3 className="kt-search-modal__heading">主要ページ</h3>
                    <ul className="kt-search-modal__links">
                        {QUICK_LINKS.map((l) => (
                            <li key={l.to}>
                                <Link
                                    to={l.to}
                                    className="kt-search-modal__link"
                                    onClick={onClose}
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="kt-search-modal__section">
                    <h3 className="kt-search-modal__heading">制作カテゴリから探す</h3>
                    <ul className="kt-search-modal__categories">
                        {sortedCategories.map((cat) => (
                            <li key={cat.id}>
                                <Link
                                    to={`/portfolio?category=${cat.id}`}
                                    className="kt-search-modal__category"
                                    onClick={onClose}
                                >
                                    {cat.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
        </FocusTrap>
    );
}
