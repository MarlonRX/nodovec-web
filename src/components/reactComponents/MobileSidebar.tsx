import React, { useState, useEffect } from 'react';
import { Home, Zap, Settings, Landmark } from 'lucide-react';
import { translate, getCurrentLanguage, type Language } from '../../i18n';

const NAV_ITEMS = [
  { key: 'dashboard', icon: Home, path: '/' },
  { key: 'transactions', icon: Zap, path: '/transactions/table' },
  { key: 'financing', icon: Landmark, path: '/financings' },
  { key: 'preferences', icon: Settings, path: '/preferences' },
] as const;

function handleLinkClick() {
  if (typeof window !== 'undefined' && window.toggleMobileSidebar) {
    window.toggleMobileSidebar(false);
  }
}

export const MobileSidebar: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLangChange);
    return () => window.removeEventListener('languageChanged', onLangChange);
  }, []);

  return (
    <nav className="mt-5 px-4 flex-1 cursor-pointer">
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const labelKey = `sidebar.${item.key}`;
          return (
            <a
              key={item.key}
              href={item.path}
              onClick={handleLinkClick}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:opacity-80 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Icon
                size={24}
                className="shrink-0 cursor-pointer"
              />
              <span className="text-sm font-medium ml-3 cursor-pointer">
                {t(labelKey)}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
