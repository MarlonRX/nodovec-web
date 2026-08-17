import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { translate, getCurrentLanguage, type Language } from '../../i18n';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLangChange);
    return () => window.removeEventListener('languageChanged', onLangChange);
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`offline-indicator ${!isOnline || showReconnected ? 'visible' : ''}`}
      style={{
        backgroundColor: showReconnected ? 'var(--semantic-success)' : 'var(--semantic-warning)',
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {showReconnected ? (
          <>
            <Wifi size={16} />
            <span>{t('mobile.backOnline')}</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>{t('mobile.offline')}</span>
          </>
        )}
      </div>
    </div>
  );
};