import React, { useState, useEffect } from 'react';
import { Home, Landmark, FileText, BarChart3, Menu } from 'lucide-react';
import { translate, getCurrentLanguage, type Language } from '../../i18n';

const NAV_ITEMS = [
  { key: 'dashboard', icon: Home, path: '/' },
  { key: 'transactions', icon: FileText, path: '/transactions/table' },
  { key: 'financing', icon: Landmark, path: '/financings' },
  { key: 'reports', icon: BarChart3, path: '/reports' },
] as const;

interface BottomNavProps {
  currentPath?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath = '/' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLangChange);
    return () => window.removeEventListener('languageChanged', onLangChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        touchStartY = e.changedTouches[0].screenY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        touchEndY = e.changedTouches[0].screenY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) {
          if (diff > 0 && !isVisible) {
            setIsVisible(true);
          } else if (diff < 0 && isVisible) {
            setIsVisible(false);
          }
        }
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isVisible]);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-primary)',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <div className="flex items-center justify-around py-2 px-4 safe-area-inset-bottom">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <a
              key={item.key}
              href={item.path}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors min-w-[60px] min-h-[44px]"
              style={{
                backgroundColor: active ? 'rgba(var(--accent-primary-rgb), 0.125)' : 'transparent',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              aria-label={t(`nav.${item.key}`)}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs font-medium">{t(`nav.${item.key}`)}</span>
            </a>
          );
        })}
        <a
          href="/preferences"
          className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors min-w-[60px] min-h-[44px]"
          style={{
            color: currentPath.startsWith('/preferences') ? 'var(--accent-primary)' : 'var(--text-secondary)',
          }}
          aria-label={t('nav.more')}
        >
          <Menu size={22} strokeWidth={currentPath.startsWith('/preferences') ? 2.5 : 2} />
          <span className="text-xs font-medium">{t('nav.more')}</span>
        </a>
      </div>
    </nav>
  );
};