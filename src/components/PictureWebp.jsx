/**
 * @file src/components/PictureWebp.jsx
 *
 * Phase 20: WebP + フォールバック付き <picture> ヘルパー。
 *
 * 用途:
 *   - public/ 配下の string パスの画像（/works/xxx.jpg など）を <picture> 化
 *   - 同階層に同名の .webp が配置されている前提
 *
 * 制約:
 *   - Vite で import した asset URL（src/assets 配下、ハッシュ付き URL）には使えない
 *     → そちらはインラインで .webp も別途 import して <picture> を書く
 *
 * 動作:
 *   - src の拡張子（.jpg / .jpeg / .png）を .webp に置換した URL を <source> に
 *   - 拡張子が一致しない（または .webp / .svg / data: 等）場合は素の <img> を返す
 *   - 既存の onError / onLoad / loading / className / その他 props を <img> に透過
 */

const RAW_EXT = /\.(jpe?g|png)$/i;

/**
 * @param {{
 *   src: string,
 *   alt: string,
 *   loading?: 'eager' | 'lazy',
 *   className?: string,
 *   onError?: (e: any) => void,
 *   onLoad?: (e: any) => void,
 *   pictureClassName?: string,
 *   pictureStyle?: object,
 * } & React.ImgHTMLAttributes<HTMLImageElement>} props
 */
export default function PictureWebp({
    src,
    alt,
    loading = 'lazy',
    className,
    onError,
    onLoad,
    pictureClassName,
    pictureStyle,
    ...rest
}) {
    const hasReplaceable = typeof src === 'string' && RAW_EXT.test(src);
    const webpSrc = hasReplaceable ? src.replace(RAW_EXT, '.webp') : null;

    if (!hasReplaceable) {
        return (
            <img
                src={src}
                alt={alt}
                loading={loading}
                className={className}
                onError={onError}
                onLoad={onLoad}
                {...rest}
            />
        );
    }

    return (
        <picture className={pictureClassName} style={pictureStyle}>
            <source srcSet={webpSrc} type="image/webp" />
            <img
                src={src}
                alt={alt}
                loading={loading}
                className={className}
                onError={onError}
                onLoad={onLoad}
                {...rest}
            />
        </picture>
    );
}
