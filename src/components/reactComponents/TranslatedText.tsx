import { useState, useEffect, createElement } from "react";
import { translate, getCurrentLanguage } from "../../i18n";

interface TranslatedTextProps {
    translationKey: string;
    className?: string;
    as?: string;
    style?: React.CSSProperties;
}

export function TranslatedText({
    translationKey,
    className = "",
    as = "span",
    style,
}: TranslatedTextProps) {
    const [text, setText] = useState<string>("");

    const updateText = () => {
        const currentLang = getCurrentLanguage();
        setText(translate(translationKey, currentLang));
    };

    useEffect(() => {
        updateText();

        const handleLanguageChange = () => {
            updateText();
        };

        window.addEventListener("languageChanged", handleLanguageChange);

        return () => {
            window.removeEventListener("languageChanged", handleLanguageChange);
        };
    }, [translationKey]);

    return createElement(as, { className, style }, text);
}
