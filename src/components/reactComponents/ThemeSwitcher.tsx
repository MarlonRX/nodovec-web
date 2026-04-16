import { useEffect, useState } from "react";
import { THEMES, getStoredTheme, setTheme, ThemeName } from "../../store/theme";
import { translate, getCurrentLanguage, type Language } from "../../i18n";

export function ThemeSwitcher({ compact }: { compact?: boolean }) {
  const [theme, setLocalTheme] = useState<ThemeName>('dark');
  const [isInitialized, setIsInitialized] = useState(false);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  // Solo leer del localStorage, NO escribir
  useEffect(() => {
    console.log('[ThemeSwitcher] Init');
    const stored = getStoredTheme();
    if (stored && THEMES.includes(stored)) {
      console.log('[ThemeSwitcher] Read theme:', stored);
      setLocalTheme(stored);
    }
    setIsInitialized(true);
  }, []);

  // Solo escribir cuando el usuario CAMBIA el tema manualmente
  const handleThemeChange = (newTheme: ThemeName) => {
    console.log('[ThemeSwitcher] User changed theme:', newTheme);
    setLocalTheme(newTheme);
    setTheme(newTheme);  // Solo aquí escribimos a localStorage
  };

  // stay in sync if otro componente cambia el tema (UserComponent, etc.)
  useEffect(() => {
    if (!isInitialized) return;
    
    const onThemeChanged = (e: Event) => {
      const t = (e as CustomEvent).detail as ThemeName;
      console.log('[ThemeSwitcher] External theme change:', t);
      setLocalTheme(t);
    };
    window.addEventListener('themeChanged', onThemeChanged);
    return () => window.removeEventListener('themeChanged', onThemeChanged);
  }, [isInitialized]);

  useEffect(() => {
    const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLangChange);
    return () => window.removeEventListener('languageChanged', onLangChange);
  }, []);

  const LABELS: Record<ThemeName, string> = {
    light: t('themes.light'),
    dark: t('themes.dark'),
    custom: t('themes.custom'),
    'obsidian': t('themes.obsidian'),
    'midnight-teal': t('themes.midnight-teal'),
    'ember': t('themes.ember'),
    'violet-dusk': t('themes.violet-dusk'),
    'forest-night': t('themes.forest-night'),
  };

  const SWATCHES: Record<ThemeName, string> = {
    light: '#4f8cff',
    dark: '#d4af37',
    custom: '#ff6f61',
    'obsidian': '#6cc3ff',
    'midnight-teal': '#2dd4bf',
    'ember': '#ff8a3d',
    'violet-dusk': '#9b7bff',
    'forest-night': '#6ee7b7',
  };

  return (
    <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-3'}`}>
      <label className={`text-xs ${compact ? 'hidden' : 'text-(--text-secondary)'}`}>{t('themes.label')}</label>

      <div
        role="listbox"
        aria-label={t('themes.selector')}
        className={`${compact ? 'flex gap-2 items-center' : 'flex items-center gap-2 flex-wrap bg-(--bg-surface) border border-(--border-primary) rounded-md px-2 py-2 max-w-full'}`}
        style={{ boxSizing: 'border-box' }}
      >
        {THEMES.map((t) => {
          const active = t === theme;
          const btnClass = compact
            ? `w-6 h-6 p-0 rounded-full flex items-center justify-center transition focus:outline-none ${active ? 'ring-2 ring-offset-1 ring-(--accent-primary) bg-[rgba(var(--accent-primary-rgb),0.12)]' : 'hover:bg-[rgba(var(--text-primary-rgb),0.04)]'}`
            : `flex items-center gap-2 px-2 py-1 rounded-md transition focus:outline-none shrink-0 ${active ? 'ring-2 ring-offset-1 ring-(--accent-primary) bg-[rgba(var(--accent-primary-rgb),0.12)]' : 'hover:bg-[rgba(var(--text-primary-rgb),0.04)]'}`;

          return (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={active}
              title={LABELS[t]}
              onClick={() => handleThemeChange(t)}
              className={btnClass}
              style={{ minWidth: compact ? undefined : 0 }}
            >
              <span
                className={`w-4 h-4 rounded-full border shrink-0`} 
                style={{ backgroundColor: SWATCHES[t] }}
              />

              {!compact && (
                <span className={`text-xs truncate max-w-32 ${active ? 'font-semibold text-(--text-primary)' : 'text-(--text-secondary)'}`}>
                  {LABELS[t]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

