import React, { useEffect } from 'react';

/**
 * Client-side component to manage sidebar link hover styles
 * Applies dynamic styling based on CSS variables after hydration
 */
export const SidebarHoverStyles: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Small delay to ensure all elements are properly rendered
    const timer = setTimeout(() => {
      const sidebarLinks = document.querySelectorAll('.sidebar-link');
      if (!sidebarLinks || sidebarLinks.length === 0) return;

      const rootStyles = getComputedStyle(document.documentElement);
      const accentRgb = (rootStyles.getPropertyValue('--accent-primary-rgb') || '212, 175, 55').trim();
      const sidebarHoverAlphaRaw = (rootStyles.getPropertyValue('--sidebar-hover-alpha') || '0.08').trim();
      const sidebarHoverAlpha = parseFloat(sidebarHoverAlphaRaw) || 0.08;
      const secondaryColor = (rootStyles.getPropertyValue('--text-secondary') || '#a0a0a0').trim();
      const invertedText = (rootStyles.getPropertyValue('--text-inverted') || '#ffffff').trim();

      sidebarLinks.forEach((link) => {
        link.addEventListener('mouseenter', function () {
          (this as HTMLElement).style.color = invertedText;
          (this as HTMLElement).style.backgroundColor = `rgba(${accentRgb}, ${sidebarHoverAlpha})`;
        });
        link.addEventListener('mouseleave', function () {
          (this as HTMLElement).style.color = secondaryColor;
          (this as HTMLElement).style.backgroundColor = 'transparent';
        });
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
};
