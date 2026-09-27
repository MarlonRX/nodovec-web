import { useEffect, useState } from "react";

export const useCssColor = (varName: string, fallback: string): string => {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (value) setColor(value);
    };
    read();
    window.addEventListener("themeChanged", read);
    return () => window.removeEventListener("themeChanged", read);
  }, [varName]);

  return color;
};
