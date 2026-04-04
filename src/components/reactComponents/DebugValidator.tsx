import { useEffect } from 'react';
import { STORAGE_CONFIG } from '../../config/api';

/**
 * Component that runs debug validation in production builds
 * Exported as a client-only component to ensure it runs after React hydration
 */
export const DebugValidator: React.FC = () => {
  console.log('[DV] Render START');
  
  useEffect(() => {
    console.log('[DV] useEffect START');
    console.log('[DV] Location:', window.location.href);
    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    console.log('[DV] Auth:', localStorage.getItem(tokenKey) ? 'YES' : 'NO');
    
    // Capture React errors
    const originalError = console.error;
    console.error = function(...args: any[]) {
      if (args[0]?.includes?.('Invalid hook call')) {
        console.log('[DV] HOOK ERROR CAPTURED! Stack:', new Error().stack);
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.log('[DV] useEffect CLEANUP');
      console.error = originalError;
    };
  }, []);
  
  console.log('[DV] Render END');
  return null;
};
