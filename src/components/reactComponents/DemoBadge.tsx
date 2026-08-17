import { useState, useEffect } from "react";
import { translate, getCurrentLanguage, type Language } from "../../i18n";

export function DemoBadge() {
    const [lang, setLang] = useState<Language>(() => getCurrentLanguage());

    useEffect(() => {
        const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
        window.addEventListener("languageChanged", onLangChange);
        return () => window.removeEventListener("languageChanged", onLangChange);
    }, []);

    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                {translate("demo.badge", lang)}
            </span>
        </div>
    );
}

export default DemoBadge;
