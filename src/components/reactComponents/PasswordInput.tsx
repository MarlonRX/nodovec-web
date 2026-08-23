import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { translate, getCurrentLanguage, type Language } from '../../i18n';

interface PasswordInputProps {
  id: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordInput({
  id,
  name,
  placeholder = "••••••••",
  required = true,
  showRequirements = false,
  className = ""
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let text = translate(key, lang);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }, [lang]);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  // Validar requisitos
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const allRequirementsMet = Object.values(requirements).every(req => req);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={password}
          onChange={handleChange}
          required={required}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-(--bg-secondary) border border-(--border-primary) rounded-none text-(--text-primary) placeholder-[var(--text-tertiary)] focus:outline-none focus:border-(--accent-primary) transition-colors pr-10 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-secondary) transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>

      {showRequirements && password && (
        <div className="mt-3 p-3 bg-(--bg-secondary) border border-(--border-primary) rounded-none">
          <p className="text-xs font-bold text-(--text-secondary) mb-2">{t("auth.passwordRequirements")}</p>
          <ul className="space-y-1 text-xs">
            <li className={`flex items-center gap-2 ${requirements.length ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.length ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.length ? '✓' : '○'}
              </span>
              {t("auth.atLeast8Chars", { count: password.length })}
            </li>
            <li className={`flex items-center gap-2 ${requirements.uppercase ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.uppercase ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.uppercase ? '✓' : '○'}
              </span>
              {t("auth.oneUppercase")}
            </li>
            <li className={`flex items-center gap-2 ${requirements.lowercase ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.lowercase ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.lowercase ? '✓' : '○'}
              </span>
              {t("auth.oneLowercase")}
            </li>
            <li className={`flex items-center gap-2 ${requirements.digit ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.digit ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.digit ? '✓' : '○'}
              </span>
              {t("auth.oneDigit")}
            </li>
            <li className={`flex items-center gap-2 ${requirements.special ? 'text-green-500' : 'text-(--text-tertiary)'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${requirements.special ? 'bg-green-500/20' : 'bg-(--border-primary)'}`}>
                {requirements.special ? '✓' : '○'}
              </span>
              {t("auth.oneSpecial")}
            </li>
          </ul>
          {allRequirementsMet && (
            <p className="text-xs text-green-500 font-bold mt-2">{t("auth.passwordStrong")}</p>
          )}
        </div>
      )}
    </div>
  );
}
