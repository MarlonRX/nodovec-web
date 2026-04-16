import esTranslations from "./locales/es.json";
import enTranslations from "./locales/en.json";
import { savePreferences, getPreference } from "../lib/preferencesStorage";

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

let currentLanguage: Language = defaultLang;

export function setLanguage(lang: Language) {
    currentLanguage = lang;
    if (typeof window !== "undefined") {
        savePreferences({ language: lang });
        window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }));
    }
}

export function getCurrentLanguage(): Language {
    if (typeof window !== "undefined") {
        const saved = getPreference("language") as Language | undefined;
        if (saved && saved in translations) {
            currentLanguage = saved;
        }
    }
    return currentLanguage;
}

export function translate(key: string, lang?: Language): string {
    const useLang = lang || getCurrentLanguage();
    const keys = key.split(".");
    let translation: any = translations[useLang];

    for (const k of keys) {
        translation = translation?.[k];
    }

    if (translation !== undefined && translation !== null) {
        return translation;
    }

    let fallback: any = translations[defaultLang];
    for (const k of keys) {
        fallback = fallback?.[k];
    }

    return fallback || key;
}

export function useTranslation() {
    return {
        t: translate,
        language: getCurrentLanguage(),
        setLanguage,
    };
}
