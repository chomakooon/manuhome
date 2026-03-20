import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * A flexible, unified Icon component for the Katachi-bin project.
 * Uses lucide-react as the primary icon set.
 * 
 * @param {string} name - The name of the icon (e.g., 'Palette', 'BookOpen').
 * @param {string} color - The icon color (defaults to current color).
 * @param {number|string} size - The size of the icon (defaults to 24).
 * @param {string} className - Additional CSS classes.
 */
const Icon = ({ name, color, size = 24, className = '', ...props }) => {
  const LucideIcon = LucideIcons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react.`);
    return null;
  }

  return (
    <LucideIcon
      color={color}
      size={size}
      className={`kb-icon ${className}`}
      {...props}
    />
  );
};

export default Icon;
