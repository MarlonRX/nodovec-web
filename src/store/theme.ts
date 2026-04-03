export type ThemeName =
  | 'light'
  | 'dark'
  | 'custom'
  | 'obsidian'
  | 'midnight-teal'
  | 'ember'
  | 'violet-dusk'
  | 'forest-night';
export const THEME_KEY = 'cash_pilot_theme';
export const THEMES: ThemeName[] = ['light', 'dark', 'custom', 'obsidian', 'midnight-teal', 'ember', 'violet-dusk', 'forest-night'];

export function applyTheme(theme: ThemeName) {
  try {
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // ignore in SSR
  }
}

export function setTheme(theme: ThemeName) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}
  applyTheme(theme);

  // notify in-app listeners so different components stay in sync
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    }
  } catch (e) {}
}

export function getStoredTheme(): ThemeName | null {
  try {
    const t = localStorage.getItem(THEME_KEY) as ThemeName | null;
    return t;
  } catch (e) {
    return null;
  }
}

export function initTheme(): ThemeName {
  // Try stored, then prefers-color-scheme, fallback to dark
  const stored = getStoredTheme();
  if (stored) {
    applyTheme(stored);
    return stored;
  }

  const prefersLight = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme: ThemeName = prefersLight ? 'light' : 'dark';
  applyTheme(theme);
  return theme;
}
