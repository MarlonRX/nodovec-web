import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { translate, getCurrentLanguage, type Language } from "../../i18n";

const DISMISS_KEY = "nodovec_demo_banner_dismissed";

export function DemoBanner() {
    const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
        window.addEventListener("languageChanged", onLangChange);
        return () => window.removeEventListener("languageChanged", onLangChange);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) {
            setVisible(false);
        }
    }, []);

    const dismiss = () => {
        sessionStorage.setItem(DISMISS_KEY, "1");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            className="flex items-center justify-center gap-3 px-4 py-2.5 border-b"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}
        >
            <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "var(--accent-primary)" }}
            />
            <span className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                {translate("demo.bannerText", lang)}
            </span>
            <a
                href="/register"
                className="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-inverted)" }}
            >
                {translate("demo.cta", lang)}
            </a>
            <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="shrink-0 p-1 rounded-md transition-opacity hover:opacity-70"
                style={{ color: "var(--text-secondary)" }}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default DemoBanner;
