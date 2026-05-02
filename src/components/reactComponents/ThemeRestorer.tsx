/**
 * Componente que restaura y sincroniza el tema guardado
 * Se ejecuta al cargar cada página para asegurar persistencia
 */

import { useEffect, useState } from 'react';

const THEME_KEY = 'cash_pilot_theme';
const VALID_THEMES = ['light', 'dark', 'custom', 'obsidian', 'midnight-teal', 'ember', 'violet-dusk', 'forest-night'];

function applyTheme(theme: string) {
  try {
    if (VALID_THEMES.includes(theme)) {
      document.documentElement.setAttribute('data-theme', theme);
      return true;
    } else {
      // eslint-disable-next-line no-console
      console.warn('[ThemeRestorer] Invalid theme:', theme);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.error('[ThemeRestorer] Error reading theme:', err);
  }
  return null;
}

export function ThemeRestorer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Restaurar tema del localStorage inmediatamente
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      applyTheme(storedTheme);
      // Disparar evento para que otros componentes sepan del cambio
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: storedTheme }));
    }

    setInitialized(true);

    // Escuchar cambios de localStorage desde otras pestañas/ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_KEY && e.newValue) {
        applyTheme(e.newValue);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: e.newValue }));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Escuchar cambios de navegación dentro de la app
    const handlePageChange = () => {
      const storedTheme = getStoredTheme();
      if (storedTheme) {
        applyTheme(storedTheme);
      }
    };

    window.addEventListener('popstate', handlePageChange);

    // Observar cambios en el pathname con un intervalo corto
    let lastPathname = window.location.pathname;
    const checkPathname = setInterval(() => {
      if (window.location.pathname !== lastPathname) {
        lastPathname = window.location.pathname;
        handlePageChange();
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePageChange);
      clearInterval(checkPathname);
    };
  }, []);

  return null;
}
