/**
 * @file src/components/PictureWebpWithFallback.jsx
 *
 * PictureWebp の拡張ラッパー。画像が存在しない（onError）場合に
 * グレー枠＋テキストのプレースホルダを表示する。
 * Mana が後から実画像を配置すれば自動で差し替わる。
 *
 * 既存の PictureWebp（default export）はそのまま利用し、壊さない。
 */

import { useState } from 'react';
import PictureWebp from './PictureWebp';
import './PictureWebpWithFallback.css';

export default function PictureWebpWithFallback({
    src,
    alt,
    placeholderText = '画像準備中',
    className = '',
    ...props
}) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div
                className={`paws-imgfallback ${className}`.trim()}
                role="img"
                aria-label={alt || placeholderText}
            >
                <svg
                    className="paws-imgfallback__icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
                <p className="paws-imgfallback__text">{placeholderText}</p>
            </div>
        );
    }

    return (
        <PictureWebp
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            {...props}
        />
    );
}
