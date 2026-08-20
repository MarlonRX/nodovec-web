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
        <div
            className="fixed top-20 left-4 z-50 flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-full border shadow-sm backdrop-blur-sm"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-primary)" }}
        >
            <div className="flex items-center gap-2">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                />
                <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                >
                    {translate("demo.badge", lang)}
                </span>
            </div>
            <a
                href="/register"
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-90"
                style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-inverted)" }}
            >
                {translate("demo.cta", lang)}
            </a>
        </div>
    );
}

export default DemoBadge;
