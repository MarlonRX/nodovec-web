import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { setTheme, getStoredTheme, initTheme, type ThemeName } from '../../store/theme';
import { translate, getCurrentLanguage, type Language } from '../../i18n';

/**
 * Animated theme toggle button with sun/moon icons.
 * Respects system preference on first visit.
 */
export function ThemeToggle() {
  const [theme, setLocalTheme] = useState<ThemeName>('dark');
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const current = initTheme();
    setLocalTheme(current);
    setMounted(true);

    const onThemeChanged = (e: Event) => {
      setLocalTheme((e as CustomEvent).detail as ThemeName);
    };
    window.addEventListener('themeChanged', onThemeChanged);

    const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLangChange);

    return () => {
      window.removeEventListener('themeChanged', onThemeChanged);
      window.removeEventListener('languageChanged', onLangChange);
    };
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setLocalTheme(next);
    setTheme(next);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        aria-label={t('themes.toggle') || 'Toggle theme'}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-(--bg-secondary) border border-(--border-primary) text-(--text-secondary) opacity-50"
      >
        <Moon className="w-5 h-5" />
      </button>
    );
  }

  const isLight = theme === 'light';

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? (t('themes.switchDark') || 'Switch to dark mode') : (t('themes.switchLight') || 'Switch to light mode')}
      title={isLight ? (t('themes.switchDark') || 'Switch to dark mode') : (t('themes.switchLight') || 'Switch to light mode')}
      className="relative w-10 h-10 rounded-full flex items-center justify-center bg-(--bg-secondary) border border-(--border-primary) text-(--text-secondary) hover:text-(--accent-primary) hover:border-(--accent-primary) transition-colors duration-300 overflow-hidden group"
    >
      <Sun
        className={`absolute w-5 h-5 transition-opacity transition-transform duration-500 ${isLight ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`}
      />
      <Moon
        className={`absolute w-5 h-5 transition-opacity transition-transform duration-500 ${isLight ? '-rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}
      />
    </button>
  );
}
