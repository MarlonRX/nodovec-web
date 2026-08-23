import { useState, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import {
    languages,
    getCurrentLanguage,
    setLanguage,
    type Language,
} from "../../i18n";
import { colorConfig } from "../../styles/colorConfig";

export function LanguageSelector({ fullWidth }: { fullWidth?: boolean } = {}) {
    const [currentLang, setCurrentLang] = useState<Language>("es");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCurrentLang(getCurrentLanguage());

        // Cerrar dropdown al hacer clic fuera
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest(".language-selector")) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageChange = (newLang: Language) => {
        setLanguage(newLang);
        setCurrentLang(newLang);
        setIsOpen(false);

        // Disparar evento personalizado para notificar el cambio
        window.dispatchEvent(
            new CustomEvent("languageChanged", { detail: newLang }),
        );

        // Recargar la página para aplicar el cambio
        window.location.reload();
    };

    const getCurrentLanguageName = () => {
        return languages[currentLang] || languages["es"];
    };

    return (
        <div className="relative language-selector">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center ${fullWidth ? 'justify-between w-full' : ''} space-x-2 px-3 py-2 text-sm font-medium rounded-none focus:outline-none transition-colors duration-200 hover:bg-amber-600/10`}
                style={{
                    color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <Globe size={16} />
                <span>{getCurrentLanguageName()}</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div
                    className={`absolute mt-2 rounded-none shadow-lg focus:outline-none z-50 ${fullWidth ? 'left-0 right-0 w-full' : 'right-0 w-48'}`}
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: `1px solid var(--border-primary)`,
                    }}
                    role="listbox"
                >
                    <div className="py-1">
                        {Object.entries(languages).map(
                            ([langCode, langName]) => (
                                <button
                                    key={`language-option-${langCode}`}
                                    onClick={() =>
                                        handleLanguageChange(
                                            langCode as Language,
                                        )
                                    }
                                    className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 focus:outline-none"
                                    style={{
                                        backgroundColor:
                                            currentLang === langCode
                                                ? `rgba(var(--accent-primary-rgb), 0.15)`
                                                : "transparent",
                                        color:
                                            currentLang === langCode
                                                ? 'var(--accent-primary)'
                                                : 'var(--text-secondary)',
                                        fontWeight:
                                            currentLang === langCode
                                                ? "600"
                                                : "400",
                                    }} 
                                    onMouseEnter={(e) => {
                                        if (currentLang !== langCode) {
                                            e.currentTarget.style.backgroundColor = `rgba(var(--accent-primary-rgb), 0.08)`;
                                            e.currentTarget.style.color = 'var(--accent-primary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (currentLang !== langCode) {
                                            e.currentTarget.style.backgroundColor =
                                                "transparent";
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                        }
                                    }}
                                    role="option"
                                    aria-selected={currentLang === langCode}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{langName}</span>
                                        {currentLang === langCode && (
                                            <Check
                                                size={16}
                                                style={{
                                                    color: 'var(--accent-primary)',
                                                }}
                                            />
                                        )}
                                    </div>
                                </button>
                            ),
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
