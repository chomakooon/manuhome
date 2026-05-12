/**
 * @file src/sites/kataribin/components/PortraitPhoto.jsx
 *
 * プロフィール写真 + フォールバック付き表示用コンポーネント（Phase 12）。
 * 画像未配置 / 読み込み失敗時はイニシャルバッジを表示する。
 *
 * 使い方:
 *   <PortraitPhoto src="/profile/mana-portrait.jpg" alt="岡崎真奈" initials="OM" />
 */

import { useState } from 'react';
import './PortraitPhoto.css';

/**
 * @param {{ src: string, alt: string, initials: string,
 *           size?: 'sm' | 'md' | 'lg', shape?: 'circle' | 'rounded' }} props
 */
export default function PortraitPhoto({
    src, alt, initials,
    size = 'md',
    shape = 'circle',
}) {
    const [failed, setFailed] = useState(false);

    const className = [
        'kt-portrait',
        `kt-portrait--${size}`,
        `kt-portrait--${shape}`,
    ].join(' ');

    if (failed) {
        return (
            <div className={className} role="img" aria-label={alt}>
                <span className="kt-portrait__initials" aria-hidden="true">
                    {initials}
                </span>
            </div>
        );
    }

    return (
        <div className={className}>
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className="kt-portrait__img"
                onError={() => setFailed(true)}
            />
        </div>
    );
}
