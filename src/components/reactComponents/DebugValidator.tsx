import { useEffect } from 'react';
import { STORAGE_CONFIG } from '../../config/api';

/**
 * Component that runs debug validation in production builds
 * Exported as a client-only component to ensure it runs after React hydration
 */
export const DebugValidator: React.FC = () => {
  useEffect(() => {
    console.log('[DebugValidator] Running client-side validation...');
    console.log('[DebugValidator] Window location:', window.location.href);
    console.log('[DebugValidator] Pathname:', window.location.pathname);
    console.log('[DebugValidator] Is demo?:', window.location.pathname.includes('/demo'));
    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    console.log('[DebugValidator] Auth token:', localStorage.getItem(tokenKey) ? 'Present' : 'Not found');
  }, []);

  return null;
};
