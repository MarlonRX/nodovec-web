/**
 * Translates a category key using the i18n function.
 * Falls back to the original value (title-cased) if no translation exists.
 */
export function translateCategory(category: string, t: (key: string) => string): string {
  if (!category) return category;
  const key = `categories.${category.toLowerCase().replace(/\s+/g, "_")}`;
  const translated = t(key);
  // If translation returns the key itself, it means no translation was found
  if (translated === key || !translated) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  return translated;
}
