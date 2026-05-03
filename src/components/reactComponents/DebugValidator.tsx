import { useEffect } from 'react';
import { STORAGE_CONFIG } from '../../config/api';

/**
 * Debug validation component for development builds.
 * No-ops in production to avoid console noise.
 */
export const DebugValidator: React.FC = () => {
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!isDev) return;

    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    // eslint-disable-next-line no-console
    console.log('[DV] Auth:', localStorage.getItem(tokenKey) ? 'YES' : 'NO');

    const originalError = console.error;
    console.error = function (...args: any[]) {
      if (args[0]?.includes?.('Invalid hook call')) {
        // eslint-disable-next-line no-console
        console.log('[DV] HOOK ERROR CAPTURED! Stack:', new Error().stack);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, [isDev]);

  return null;
};
