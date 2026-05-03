import { useEffect, useCallback } from 'react';

/**
 * Register a global keyboard shortcut.
 * @param key - The key to listen for (e.g., 'n')
 * @param callback - Function to call when shortcut is triggered
 * @param metaKey - Require Cmd/Ctrl to be pressed (default: true)
 */
export function useGlobalShortcut(key: string, callback: () => void, metaKey = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (metaKey && !isMeta) return;
      if (metaKey && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    },
    [key, callback, metaKey]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
