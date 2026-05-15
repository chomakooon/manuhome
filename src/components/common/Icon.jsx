import { createElement } from 'react';
import { getIconByName } from '../../lib/iconRegistry';

/**
 * A flexible, unified Icon component for the Katachi-bin project.
 * Uses lucide-react as the primary icon set.
 *
 * @param {string} name - The name of the icon (e.g., 'Palette', 'BookOpen').
 * @param {string} color - The icon color (defaults to current color).
 * @param {number|string} size - The size of the icon (defaults to 24).
 * @param {string} className - Additional CSS classes.
 *
 * Phase 23: `<LucideIcon ... />` という JSX で書くと
 * react-hooks/static-components がレンダー中のコンポーネント生成と誤検知するため、
 * 既存コンポーネントへの参照を `createElement` で明示的に組み立てる方式に変更。
 * `getIconByName` はレジストリからの参照取得（生成ではない）。
 */
const Icon = ({ name, color, size = 24, className = '', ...props }) => {
    const lucideIcon = getIconByName(name);

    if (!lucideIcon) {
        console.warn(`Icon "${name}" not found in lucide-react.`);
        return null;
    }

    return createElement(lucideIcon, {
        color,
        size,
        className: `kb-icon ${className}`,
        ...props,
    });
};

export default Icon;
