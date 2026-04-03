/**
 * Simple validation script to check if JavaScript execution is working
 * This helps diagnose blank page issues in production builds
 */

export function executeDebugValidation() {
  if (typeof window === 'undefined') {
    console.log('[DEBUG] Running in server environment');
    return;
  }

  console.log('[DEBUG] Client-side JavaScript is executing');
  console.log('[DEBUG] Window object available:', !!window);
  console.log('[DEBUG] Document object available:', !!document);
  console.log('[DEBUG] React version: checking for React hydration...');

  // Check if React is loaded
  const checkReact = () => {
    const root = document.getElementById('root');
    const astroIslands = document.querySelectorAll('[data-astro-root]');
    
    console.log('[DEBUG] Root element found:', !!root);
    console.log('[DEBUG] Astro islands found:', astroIslands.length);

    // Check for any React-rendered content indicators
    const reactRoots = document.querySelectorAll('[data-reactroot], [data-reactcomplete]');
    console.log('[DEBUG] React root elements:', reactRoots.length);

    if (astroIslands.length === 0) {
      console.warn('[DEBUG] No Astro islands found - check if islands are being rendered');
    }
  };

  // Run checks after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkReact);
  } else {
    checkReact();
  }

  // Monitor for any runtime errors
  window.addEventListener('error', (event) => {
    console.error('[DEBUG] Runtime error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[DEBUG] Unhandled promise rejection:', event.reason);
  });
}

// Execute on import
if (typeof window !== 'undefined') {
  console.log('[DEBUG] Debug validation module loaded');
  executeDebugValidation();
}
