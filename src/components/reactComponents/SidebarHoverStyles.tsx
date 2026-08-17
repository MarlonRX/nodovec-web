import React, { useEffect } from 'react';

/**
 * Client-side component to manage sidebar link hover styles
 * Applies dynamic styling based on CSS variables after hydration
 */
export const SidebarHoverStyles: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    const cleanups: (() => void)[] = [];

    // Small delay to ensure all elements are properly rendered
    const timer = setTimeout(() => {
      const sidebarLinks = document.querySelectorAll('.sidebar-link');
      if (!sidebarLinks || sidebarLinks.length === 0) {
        // No links found, nothing to clean up beyond the timer
        return;
      }

      const rootStyles = getComputedStyle(document.documentElement);
      const accentRgb = (rootStyles.getPropertyValue('--accent-primary-rgb') || '212, 175, 55').trim();
      const sidebarHoverAlphaRaw = (rootStyles.getPropertyValue('--sidebar-hover-alpha') || '0.08').trim();
      const sidebarHoverAlpha = parseFloat(sidebarHoverAlphaRaw) || 0.08;
      const secondaryColor = (rootStyles.getPropertyValue('--text-secondary') || '#a0a0a0').trim();
      const invertedText = (rootStyles.getPropertyValue('--text-inverted') || '#ffffff').trim();

      sidebarLinks.forEach((link) => {
        const el = link as HTMLElement;
        const onMouseEnter = () => {
          el.style.color = invertedText;
          el.style.backgroundColor = `rgba(${accentRgb}, ${sidebarHoverAlpha})`;
        };
        const onMouseLeave = () => {
          el.style.color = secondaryColor;
          el.style.backgroundColor = 'transparent';
        };
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
        cleanups.push(() => {
          el.removeEventListener('mouseenter', onMouseEnter);
          el.removeEventListener('mouseleave', onMouseLeave);
        });
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
};