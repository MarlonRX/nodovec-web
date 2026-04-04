import React, { useEffect } from 'react';

/**
 * Client-side component to manage sidebar layout updates
 * Handles margin adjustments and DOM synchronization after React hydration completes
 */
export const SidebarLayoutManager: React.FC = () => {
  console.log('[SLM] Render START');
  
  useEffect(() => {
    console.log('[SLM] useEffect START');
    if (typeof window === 'undefined') {
      console.log('[SLM] SSR detected, skipping');
      return;
    }

    function updateMainMargin() {
      const sidebar = document.getElementById('sidebar');
      const mainContent = document.getElementById('main-content');

      if (!sidebar || !mainContent) {
        console.log('[SLM] Elements not found, skipping update');
        return;
      }

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
        console.log('[SLM] Mutation detected');
        updateMainMargin();
      });

      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class'],
      });

      // Cleanup
      return () => {
        console.log('[SLM] useEffect CLEANUP');
        observer.disconnect();
      };
    }
  }, []);

  console.log('[SLM] Render END');
  // This component doesn't render anything
  return null;
};
