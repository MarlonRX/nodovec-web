import { useEffect, useRef, useState } from "react";
import { THEMES, getStoredTheme, setTheme, ThemeName } from "../../store/theme";
import { LanguageSelector } from "./LanguageSelector";
import { CurrencySelector } from "./CurrencySelector";
import { Camera, Save } from "lucide-react";
import { authStore } from "../../store/auth";
import { uploadUserAvatar } from "../../services/userServices";
import { toast } from "sonner";
import { savePreferences, getPreferences } from "../../lib/preferencesStorage";
import { getCurrentLanguage, translate, type Language } from "../../i18n";

type Currency = 'USD' | 'EUR' | 'COP';

const SWATCHES: Record<ThemeName, string> = {
  light: "#4f8cff",
  dark: "#d4af37",
  custom: "#ff6f61",
  obsidian: "#6cc3ff",
  "midnight-teal": "#2dd4bf",
  ember: "#ff8a3d",
  "violet-dusk": "#9b7bff",
  "forest-night": "#6ee7b7",
};

export function UserComponent() {
  const [theme, setLocalTheme] = useState<ThemeName>("dark");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [language, setLanguage] = useState<string>("es");
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = (key: string) => translate(key, lang);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialPrefsRef = useRef<{ theme: ThemeName; currency: Currency; language: string }>({
    theme: "dark",
    currency: "USD",
    language: "es",
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Leer tema directamente de localStorage
      const storedThemeValue = localStorage.getItem('cash_pilot_theme') as ThemeName | null;
      const themeToSet: ThemeName = (storedThemeValue && THEMES.includes(storedThemeValue)) ? storedThemeValue : "dark";

      // Leer currency  
      const storedCurrency = (localStorage.getItem("cash_pilot_currency") as Currency) || "USD";

      // Leer language
      const storedLanguage = getCurrentLanguage() || "es";

      // Actualizar estados
      setLocalTheme(themeToSet);
      setCurrency(storedCurrency);
      setLanguage(storedLanguage);

      // Aplicar tema inmediatamente al DOM
      document.documentElement.setAttribute('data-theme', themeToSet);

      // Guardar las preferencias iniciales
      initialPrefsRef.current = {
        theme: themeToSet,
        currency: storedCurrency,
        language: storedLanguage,
      };

      setIsInitialized(true);
    } catch (err) {
      console.error("[UC] Error initializing:", err);
      setIsInitialized(true);
    }
  }, []);

  // Sincronizar tema cuando cambia en otros componentes
  useEffect(() => {
    const handleThemeChanged = (e: Event) => {
      const t = (e as CustomEvent).detail as ThemeName;
      if (t !== theme) {
        setLocalTheme(t);
      }
    };

    window.addEventListener('themeChanged', handleThemeChanged);
    return () => window.removeEventListener('themeChanged', handleThemeChanged);
  }, [theme]);

  // Sincronizar idioma cuando cambia en otros componentes
  useEffect(() => {
    const handleLangChanged = (e: Event) => {
      setLang((e as CustomEvent).detail as Language);
    };
    window.addEventListener('languageChanged', handleLangChanged);
    return () => window.removeEventListener('languageChanged', handleLangChanged);
  }, []);

  // Detectar cambios en las preferencias
  useEffect(() => {
    if (!isInitialized) return;

    const changed =
      theme !== initialPrefsRef.current.theme ||
      currency !== initialPrefsRef.current.currency ||
      language !== initialPrefsRef.current.language;

    setHasUnsavedChanges(changed);
  }, [theme, currency, language, isInitialized]);

  // Aplicar tema a DOM cuando cambia (preview visual)
  useEffect(() => {
    if (!isInitialized) return;

    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch (err) {
      console.error('Error applying theme preview:', err);
    }
  }, [theme, isInitialized]);

  // Avatar (server URL preferred, fallback to localStorage)
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // extracted handler that accepts a File (used by input change and drop)
  const handleFile = async (f: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error(t('user.onlyImages'));
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error(t('user.imageTooLarge'));
      return;
    }

    // Si el usuario está autenticado, subir al backend primero
    const currentUser = authStore.getUser();
    if (currentUser && currentUser.uuid) {
      try {
        const resp = await uploadUserAvatar(currentUser.uuid, f);
        if (resp && typeof resp === 'object' && 'data' in resp && resp.data && resp.data.data && resp.data.data.avatar_url) {
          const url = resp.data.data.avatar_url as string;
          setAvatar(url);
          try { localStorage.setItem("cash_pilot_avatar", url); } catch (err) { }
          // actualizar authStore para que LoginButton y demás muestren la nueva URL
          authStore.updateUser({ avatar: url });
          window.dispatchEvent(new CustomEvent("avatarChanged", { detail: url }));
          const msg = (resp as any).data?.message || t('user.avatarUpdated');
          toast.success(msg);
          return;
        }

        // Si el servicio devolvió { response: false, message: '...' }, mostrar mensaje
        if ((resp as any)?.response === false) {
          toast.error((resp as any).message || t('user.avatarUploadError'));
        }
        // Si no vino URL, continuar con preview local
      } catch (err: any) {
        console.error("avatar upload error", err);
        toast.error(err?.response?.data?.message || t('user.avatarUploadErrorLocal'));
        // continuar para crear preview local
      }
    }

    // Fallback: crear preview local (data URL) y guardar localmente
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setAvatar(dataUrl);
      try {
        localStorage.setItem("cash_pilot_avatar", dataUrl);
      } catch (err) { }
      window.dispatchEvent(new CustomEvent("avatarChanged", { detail: dataUrl }));
    };
    reader.readAsDataURL(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    void handleFile(f);
  };

  const removeAvatar = () => {
    setAvatar(null);
    try {
      localStorage.removeItem("cash_pilot_avatar");
    } catch (err) { }
    window.dispatchEvent(new CustomEvent("avatarChanged", { detail: null }));
  };

  // Currency selection
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // 1. Guardar tema PRIMERO, directamente a localStorage
      const themeSaved = localStorage.setItem('cash_pilot_theme', theme);

      document.documentElement.setAttribute('data-theme', theme);

      // 3. Disparar evento de cambio de tema (para sincronización global)
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));

      // 4. Guardar todas las preferencias en backup consolidado
      savePreferences({
        language: language,
        currency: currency,
        theme: theme,
      });

      // 5. Guardar moneda también en localStorage
      localStorage.setItem("cash_pilot_currency", currency);
      window.dispatchEvent(new CustomEvent("currencyChanged", { detail: currency }));

      // 6. Actualizar referencias iniciales para limpiar el indicador de cambios
      initialPrefsRef.current = {
        theme: theme,
        currency: currency,
        language: language,
      };

      // 7. Marcar como guardado
      setHasUnsavedChanges(false);
      toast.success(t('user.preferencesSaved'));

      // 8. Verificar que el tema se guardó (para debugging)
      setTimeout(() => {
        const verify = localStorage.getItem('cash_pilot_theme');
        if (verify !== theme) {
          console.warn('[UserComponent] WARNING: Theme mismatch after save!', verify, 'vs', theme);
        }
      }, 100);
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast.error(t('user.preferencesError'));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const user = authStore.getUser();
    if (user?.avatar) {
      setAvatar(user.avatar);
    } else {
      setAvatar(localStorage.getItem("cash_pilot_avatar"));
    }
  }, []);

  const LABELS: Record<ThemeName, string> = {
    light: t('themes.light'),
    dark: t('themes.dark'),
    custom: t('themes.custom'),
    obsidian: t('themes.obsidian'),
    "midnight-teal": t('themes.midnight-teal'),
    ember: t('themes.ember'),
    "violet-dusk": t('themes.violet-dusk'),
    "forest-night": t('themes.forest-night'),
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
          {t("preferences.title")}
        </h1>
        <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
          {t("preferences.description")}
        </p>
      </div>
      <div className="flex justify-center w-full">
        <section className="max-w-6xl w-full mx-auto rounded-none p-8 md:p-10 bg-(--bg-surface) border border-(--border-primary) shadow-md">
          <div className="mt-4">
            <div className="w-full min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-8 items-start w-full">
                {/* Left: Avatar / image area (30%) */}
                <div className="flex flex-col items-center md:items-center justify-center gap-4 w-full">
                  <AvatarUploader
                    avatar={avatar}
                    isDragging={isDragging}
                    fileRef={fileRef}
                    onFileChange={onFileChange}
                    onDragOver={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(true); }}
                    onDragEnter={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(false); }}
                    onDrop={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(false); const file = ev.dataTransfer?.files?.[0]; if (file) void handleFile(file); }}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
                    t={t}
                  />
                  <div className="text-sm text-center md:text-left mt-2" style={{ color: 'var(--text-secondary)' }}>{t('user.changePhotoHint')}</div>
                </div>

                {/* Right: controls (Idioma, Moneda, Tema) (70%) */}
                <PreferencesControls
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  theme={theme}
                  onSelectTheme={setLocalTheme}
                  labels={LABELS}
                  swatches={SWATCHES}
                  hasUnsavedChanges={hasUnsavedChanges}
                  isSaving={isSaving}
                  onSave={handleSavePreferences}
                  t={t}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

interface AvatarUploaderProps {
  avatar: string | null;
  isDragging: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (ev: React.DragEvent) => void;
  onDragEnter: (ev: React.DragEvent) => void;
  onDragLeave: (ev: React.DragEvent) => void;
  onDrop: (ev: React.DragEvent) => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  t: (key: string) => string;
}

function AvatarUploader({
  avatar,
  isDragging,
  fileRef,
  onFileChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onClick,
  onKeyDown,
  t,
}: AvatarUploaderProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative w-36 h-36 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-(--accent-primary) ${isDragging ? 'ring-2 ring-offset-1 ring-(--accent-primary) scale-105' : ''}`}
      style={{ background: avatar ? "transparent" : "var(--accent-primary)", borderColor: "rgba(var(--accent-primary-rgb),0.18)" }}
      aria-label={t('user.changePhotoAria')}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xl font-bold text-(--text-inverted)">UP</span>
      )}

      <div className={`absolute inset-0 transition-opacity duration-150 flex items-center justify-center pointer-events-none ${isDragging ? 'opacity-100 bg-black/40 dark:bg-white/10' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100 bg-black/30 dark:bg-white/10'}`}>
        <div className="flex flex-col items-center gap-1">
          <Camera size={28} className="text-(--text-inverted)" />
          <span className="text-xs text-(--text-inverted)">{isDragging ? t('user.dropToUpload') : t('user.changePhoto')}</span>
        </div>
      </div>

      <input ref={fileRef} onChange={onFileChange} accept="image/*" type="file" className="hidden" />
    </div>
  );
}

interface ThemeSwatchSelectorProps {
  theme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
  labels: Record<ThemeName, string>;
  swatches: Record<ThemeName, string>;
  t: (key: string) => string;
}

function ThemeSwatchSelector({ theme, onSelectTheme, labels, swatches, t }: ThemeSwatchSelectorProps) {
  return (
    <div>
      <label htmlFor="theme-selector-user" className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>{t('themes.label')}</label>
      <div id="theme-selector-user" className="flex gap-3 flex-wrap" role="listbox" aria-label={t('themes.selector')}>
        {THEMES.map((th) => {
          const active = th === theme;
          return (
            <button
              key={th}
              onClick={() => onSelectTheme(th)}
              role="option"
              aria-selected={active}
              className={`w-12 h-12 rounded-full border shrink-0 transition ${active ? 'ring-2 ring-offset-1 ring-(--accent-primary) bg-[rgba(var(--accent-primary-rgb),0.12)]' : 'hover:brightness-105'}`}
              style={{ backgroundColor: swatches[th] }}
              title={labels[th]}
            />
          );
        })}
      </div>
    </div>
  );
}

interface SavePreferencesBarProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  t: (key: string) => string;
}

function SavePreferencesBar({ hasUnsavedChanges, isSaving, onSave, t }: SavePreferencesBarProps) {
  return (
    <div className="mt-8 pt-6 border-t border-(--border-primary)">
      <div className="flex items-center justify-between gap-4">
        <div>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-(--semantic-error) animate-pulse"></div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('user.unsavedChanges')}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-none font-semibold text-sm tracking-wider transition-colors mr-10 ${hasUnsavedChanges && !isSaving
            ? 'bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) cursor-pointer'
            : 'bg-(--bg-secondary) text-(--text-tertiary) cursor-not-allowed opacity-50'
            }`}
        >
          <Save size={16} />
          <span>{isSaving ? t('user.saving') : t('user.savePreferences')}</span>
        </button>
      </div>
    </div>
  );
}

interface PreferencesControlsProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  theme: ThemeName;
  onSelectTheme: (t: ThemeName) => void;
  labels: Record<ThemeName, string>;
  swatches: Record<ThemeName, string>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  t: (key: string) => string;
}

function PreferencesControls({
  currency,
  onCurrencyChange,
  theme,
  onSelectTheme,
  labels,
  swatches,
  hasUnsavedChanges,
  isSaving,
  onSave,
  t,
}: PreferencesControlsProps) {
  return (
    <div className="flex flex-col gap-6 w-full md:pl-6 md:ml-4 md:border-l md:border-(--border-primary)">
      <div className="w-full md:hidden">
        <hr className="border-(--border-primary) my-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 items-start">
        <div className="w-full md:max-w-xs">
          <label htmlFor="language-selector" className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>{t('user.language')}</label>
          <LanguageSelector fullWidth id="language-selector" />
        </div>
        <div className="w-full md:max-w-xs">
          <label htmlFor="currency-selector" className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>{t('user.currency')}</label>
          <CurrencySelector value={currency} onChange={(c) => onCurrencyChange(c)} fullWidth id="currency-selector" />
        </div>
      </div>
      <ThemeSwatchSelector theme={theme} onSelectTheme={onSelectTheme} labels={labels} swatches={swatches} t={t} />
      <SavePreferencesBar hasUnsavedChanges={hasUnsavedChanges} isSaving={isSaving} onSave={onSave} t={t} />
    </div>
  );
}
