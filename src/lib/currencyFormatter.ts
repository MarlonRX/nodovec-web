/**
 * Currency formatting utilities
 */

/**
 * Format a number as currency with $ symbol and comma separators
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a number as currency without the $ symbol
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted number string (e.g., "1,234.56")
 */
export const formatNumber = (
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a value as currency with optional sign prefix for positive values
 * @param value - The numeric value to format
 * @param showSign - Show '+' prefix for positive values (default: false)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with optional sign
 */
export const formatCurrencyWithSign = (
  value: number,
  showSign: boolean = false,
  decimals: number = 2
): string => {
  const formatted = formatCurrency(value, decimals);
  if (showSign && value > 0) {
    return `+${formatted}`;
  }
  return formatted;
};
