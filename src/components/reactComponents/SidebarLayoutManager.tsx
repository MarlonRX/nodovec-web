import React, { useEffect } from 'react';

/**
 * Client-side component to manage sidebar layout updates
 * Handles margin adjustments and DOM synchronization after React hydration completes
 */
export const SidebarLayoutManager: React.FC = () => {
  useEffect(() => {
    // Only run after React has hydrated
    if (typeof window === 'undefined') return;

    function updateMainMargin() {
      const sidebar = document.getElementById('sidebar');
      const mainContent = document.getElementById('main-content');

      if (!sidebar || !mainContent) return;

      if (sidebar.classList.contains('open')) {
        mainContent.style.marginLeft = '16rem'; // w-64
      } else {
        mainContent.style.marginLeft = '5rem'; // w-20
      }
    }

    // Initial update
    updateMainMargin();

    // Observe sidebar class changes for responsive updates
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const observer = new MutationObserver(() => {
        updateMainMargin();
      });

      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class'],
      });

      // Cleanup
      return () => observer.disconnect();
    }
  }, []);

  // This component doesn't render anything
  return null;
};
