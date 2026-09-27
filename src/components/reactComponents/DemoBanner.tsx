import { useState, useEffect } from "react";
import { X } from "lucide-react";
import StarBorder from "../reactbits/StarBorder";
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
                className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: "var(--accent-primary)" }}
            />
            <span className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                {translate("demo.bannerText", lang)}
            </span>
            <StarBorder
                as="a"
                href="/register"
                className="shrink-0"
                color="var(--accent-primary)"
                borderColor="rgba(var(--accent-primary-rgb), 0.4)"
                speed="5s"
            >
                <span className="text-xs whitespace-nowrap">{translate("demo.cta", lang)}</span>
            </StarBorder>
            <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="shrink-0 p-1 rounded-none transition-opacity hover:opacity-70"
                style={{ color: "var(--text-secondary)" }}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default DemoBanner;
