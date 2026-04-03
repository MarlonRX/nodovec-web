import { useEffect, useRef, useState } from "react";
import { THEMES, getStoredTheme, setTheme, ThemeName } from "../../store/theme";
import { LanguageSelector } from "./LanguageSelector";
import { CurrencySelector } from "./CurrencySelector";
import { Camera } from "lucide-react";
import { authStore } from "../../store/auth";
import { uploadUserAvatar } from "../../services/userServices";
import { toast } from "sonner";

type Currency = 'USD' | 'EUR' | 'COP';

export function UserComponent() {
  const [theme, setLocalTheme] = useState<ThemeName>("dark");

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setLocalTheme(stored);
    }
  }, []);

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  // stay in sync with other theme controls (e.g. ThemeSwitcher)
  useEffect(() => {
    const onThemeChanged = (e: Event) => {
      const t = (e as CustomEvent).detail as ThemeName;
      setLocalTheme(t);
    };
    window.addEventListener('themeChanged', onThemeChanged);
    return () => window.removeEventListener('themeChanged', onThemeChanged);
  }, []);

  // Avatar (server URL preferred, fallback to localStorage)
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // extracted handler that accepts a File (used by input change and drop)
  const handleFile = async (f: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Imagen demasiado grande (máx 2MB)");
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
          try { localStorage.setItem("cash_pilot_avatar", url); } catch (err) {}
          // actualizar authStore para que LoginButton y demás muestren la nueva URL
          authStore.updateUser({ avatar: url });
          window.dispatchEvent(new CustomEvent("avatarChanged", { detail: url }));
          const msg = (resp as any).data?.message || "Avatar actualizado";
          toast.success(msg);
          return;
        }

        // Si el servicio devolvió { response: false, message: '...' }, mostrar mensaje
        if ((resp as any)?.response === false) {
          toast.error((resp as any).message || "Error subiendo avatar");
        }
        // Si no vino URL, continuar con preview local
      } catch (err: any) {
        console.error("avatar upload error", err);
        toast.error(err?.response?.data?.message || "Error subiendo avatar — se usará preview local");
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
      } catch (err) {}
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
    } catch (err) {}
    window.dispatchEvent(new CustomEvent("avatarChanged", { detail: null }));
  };

  // Currency selection
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const user = authStore.getUser();
    if (user?.avatar) {
      setAvatar(user.avatar);
    } else {
      setAvatar(localStorage.getItem("cash_pilot_avatar"));
    }

    const storedCurrency = localStorage.getItem("cash_pilot_currency") as Currency | null;
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("cash_pilot_currency", currency);
    } catch (err) {}
    window.dispatchEvent(new CustomEvent("currencyChanged", { detail: currency }));
  }, [currency]);

  const LABELS: Record<ThemeName, string> = {
    light: "Claro",
    dark: "Oscuro",
    custom: "Personalizado",
    obsidian: "Obsidiana",
    "midnight-teal": "Medianoche Turquesa",
    ember: "Brasa Nocturna",
    "violet-dusk": "Violeta Crepúsculo",
    "forest-night": "Bosque Nocturno",
  };

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

  return (
    <div className="w-full min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-8 items-start w-full">
        {/* Left: Avatar / image area (30%) */}
        <div className="flex flex-col items-center md:items-center justify-center gap-4 w-full">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
            onDragOver={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(true); }}
            onDragEnter={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(true); }}
            onDragLeave={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(false); }}
            onDrop={(ev) => { ev.preventDefault(); ev.stopPropagation(); setIsDragging(false); const file = ev.dataTransfer?.files?.[0]; if (file) void handleFile(file); }}
            className={`group relative w-36 h-36 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-(--accent-primary) ${isDragging ? 'ring-2 ring-offset-1 ring-(--accent-primary) scale-105' : ''}`}
            style={{ background: avatar ? "transparent" : "var(--accent-primary)", borderColor: "rgba(var(--accent-primary-rgb),0.18)" }}
            aria-label="Cambiar foto de perfil (arrastra o haz click para subir)"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-(--text-inverted)">UP</span>
            )}

            {/* hover/focus overlay to indicate clickability / drag state */}
            <div className={`absolute inset-0 transition-opacity duration-150 flex items-center justify-center pointer-events-none ${isDragging ? 'opacity-100 bg-black/40 dark:bg-white/10' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100 bg-black/30 dark:bg-white/10'}`}>
              <div className="flex flex-col items-center gap-1">
                <Camera size={28} className="text-(--text-inverted)" />
                <span className="text-xs text-(--text-inverted)">{isDragging ? 'Suelta para subir' : 'Cambiar foto'}</span>
              </div>
            </div>

            {/* hidden input stays inside avatar for click-to-change */}
            <input ref={fileRef} onChange={onFileChange} accept="image/*" type="file" className="hidden" />
          </div>

          <div className="text-sm text-center md:text-left mt-2" style={{ color: 'var(--text-secondary)' }}>Cambiar foto de perfil (max 2MB)</div>
        </div>

        {/* Right: controls (Idioma, Moneda, Tema) (70%) */}
        <div className="flex flex-col gap-6 w-full md:pl-6 md:ml-4 md:border-l md:border-(--border-primary)">
          {/* small-screen divider between avatar + controls */}
          <div className="w-full md:hidden">
            <hr className="border-(--border-primary) my-2" />
          </div>
          <div className="grid grid-cols-1 gap-4 items-start">
            <div className="w-full md:max-w-xs">
              <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>Idioma</label>
              <LanguageSelector fullWidth />
            </div>

            <div className="w-full md:max-w-xs">
              <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>Moneda</label>
              <CurrencySelector value={currency} onChange={(c) => setCurrency(c)} fullWidth />
            </div>
          </div>

          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>Tema</label>
            <div className="flex gap-3 flex-wrap" role="listbox" aria-label="Selector de tema">
              {THEMES.map((t) => {
                const active = t === theme;
                return (
                  <button
                    key={t}
                    onClick={() => setLocalTheme(t)}
                    role="option"
                    aria-selected={active}
                    aria-pressed={active}
                    className={`w-12 h-12 rounded-full border shrink-0 transition ${active ? 'ring-2 ring-offset-1 ring-(--accent-primary) bg-[rgba(var(--accent-primary-rgb),0.12)]' : 'hover:brightness-105'}`}
                    style={{ backgroundColor: SWATCHES[t] }}
                    title={LABELS[t]}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

