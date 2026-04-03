// Configuración simple de i18n
import esTranslations from "./locales/es.json";
import enTranslations from "./locales/en.json";

export const languages = {
    es: "Español",
    en: "English",
};

export const defaultLang = "es";

const translations = {
    es: esTranslations,
    en: enTranslations,
};

export type Language = keyof typeof translations;

// Variable global para el idioma actual
let currentLanguage: Language = defaultLang;

// Función para cambiar el idioma
export function setLanguage(lang: Language) {
    currentLanguage = lang;
    if (typeof window !== "undefined") {
        localStorage.setItem("cash-pilot-language", lang);
    }
}

// Función para obtener el idioma actual
export function getCurrentLanguage(): Language {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("cash-pilot-language") as Language;
        if (saved && saved in translations) {
            currentLanguage = saved;
        }
    }
    return currentLanguage;
}

// Función para obtener traducción
export function translate(key: string, lang?: Language): string {
    const useLang = lang || getCurrentLanguage();
    const keys = key.split(".");
    let translation: any = translations[useLang];

    for (const k of keys) {
        translation = translation?.[k];
    }

    if (translation) {
        return translation;
    }

    // Fallback al idioma por defecto
    let fallback: any = translations[defaultLang];
    for (const k of keys) {
        fallback = fallback?.[k];
    }

    return fallback || key;
}

// Hook para usar en componentes React
export function useTranslation() {
    return {
        t: translate,
        language: getCurrentLanguage(),
        setLanguage,
    };
}
