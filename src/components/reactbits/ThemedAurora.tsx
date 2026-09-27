import { useEffect, useState } from "react";
import Aurora from "./Aurora";

const readThemeStops = (): { stops: string[]; lightMode: boolean } => {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  const accent = v("--accent-primary", "#ff6b45");
  const hover = v("--accent-hover", accent);
  const info = v("--semantic-info", accent);

  const bg = v("--bg-primary", "#121211").replace("#", "");
  const full = bg.length === 3 ? bg.split("").map((c) => c + c).join("") : bg;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0);
  const lightMode = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;

  return { stops: [hover, accent, info], lightMode };
};

interface ThemedAuroraProps {
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
}

export default function ThemedAurora({ className = "", ...props }: ThemedAuroraProps) {
  const [theme, setTheme] = useState(() => readThemeStops());

  useEffect(() => {
    const update = () => setTheme(readThemeStops());
    window.addEventListener("themeChanged", update);
    document.fonts.ready.then(update);
    return () => window.removeEventListener("themeChanged", update);
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <Aurora colorStops={theme.stops} lightMode={theme.lightMode} {...props} />
    </div>
  );
}
