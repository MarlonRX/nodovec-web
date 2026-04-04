/**
 * Componente que restaura y sincroniza el tema guardado
 * Se ejecuta al cargar cada página para asegurar persistencia
 */

import { useEffect, useState } from 'react';

const THEME_KEY = 'cash_pilot_theme';
const VALID_THEMES = ['light', 'dark', 'custom', 'obsidian', 'midnight-teal', 'ember', 'violet-dusk', 'forest-night'];

function logThemeState(prefix: string) {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    const currentAttr = document.documentElement.getAttribute('data-theme');
    const allStorage = Object.entries(localStorage)
      .filter(([k]) => k.includes('theme') || k.includes('cash'))
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    console.log(`[ThemeState] ${prefix} | stored="${stored}" | attr="${currentAttr}" | allStorage=[${allStorage}]`);
  } catch (err) {
    console.error('[ThemeState] Error logging:', err);
  }
}

function applyTheme(theme: string) {
  try {
    if (VALID_THEMES.includes(theme)) {
      document.documentElement.setAttribute('data-theme', theme);
      logThemeState(`Applied theme: ${theme}`);
      return true;
    } else {
      console.warn('[ThemeRestorer] Invalid theme:', theme);
    }
  } catch (err) {
    console.error('[ThemeRestorer] Error applying theme:', err);
  }
  return false;
}

function getStoredTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme && VALID_THEMES.includes(theme)) {
      return theme;
    }
  } catch (err) {
    console.error('[ThemeRestorer] Error reading theme:', err);
  }
  return null;
}

export function ThemeRestorer() {
  console.log('[TR] Render START');
  const [initialized, setInitialized] = useState(false);
  console.log('[TR] State initialized');

  useEffect(() => {
    console.log('[TR] useEffect START');
    logThemeState('Mount start');

    // Restaurar tema del localStorage inmediatamente
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      console.log('[ThemeRestorer] Found stored theme:', storedTheme);
      applyTheme(storedTheme);
      // Disparar evento para que otros componentes sepan del cambio
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: storedTheme }));
    } else {
      console.warn('[ThemeRestorer] No stored theme found');
      logThemeState('No theme stored');
    }

    setInitialized(true);

    // Escuchar cambios de localStorage desde otras pestañas/ventanas
    const handleStorageChange = (e: StorageEvent) => {
      console.log('[ThemeRestorer] Storage event:', e.key, '=', e.newValue);
      if (e.key === THEME_KEY && e.newValue) {
        console.log('[ThemeRestorer] Storage changed from another tab:', e.newValue);
        applyTheme(e.newValue);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: e.newValue }));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Escuchar cambios de navegación dentro de la app
    const handlePageChange = () => {
      console.log('[ThemeRestorer] Page change detected');
      const storedTheme = getStoredTheme();
      if (storedTheme) {
        console.log('[ThemeRestorer] Restoring after navigation:', storedTheme);
        applyTheme(storedTheme);
      } else {
        console.warn('[ThemeRestorer] No theme to restore after navigation');
        logThemeState('No theme after nav');
      }
    };

    // Escuchar eventos de navegación
    window.addEventListener('popstate', handlePageChange);
    
    // Observar cambios en el pathname con un intervalo corto
    let lastPathname = window.location.pathname;
    const checkPathname = setInterval(() => {
      if (window.location.pathname !== lastPathname) {
        console.log('[ThemeRestorer] Pathname changed from', lastPathname, 'to', window.location.pathname);
        lastPathname = window.location.pathname;
        handlePageChange();
      }
    }, 100);

    return () => {
      console.log('[TR] useEffect CLEANUP');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePageChange);
      clearInterval(checkPathname);
    };
  }, []);
  console.log('[TR] Render END');

  return null;
}
