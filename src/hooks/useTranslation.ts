import { useState, useEffect, useCallback } from "react";
import { translate, getCurrentLanguage, type Language } from "@/i18n";

/**
 * Hook de traducción reactivo.
 *
 * Centraliza el patrón (duplicado en casi todos los componentes) de:
 *   - leer el idioma actual
 *   - escuchar el evento global `languageChanged`
 *   - exponer una función `t` memoizada por idioma
 *
 * Uso:
 *   const { t, lang } = useTranslation();
 */
export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  return { t, lang };
}
