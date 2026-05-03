import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatCurrencyWithSign } from './currencyFormatter';

describe('formatCurrency', () => {
  it('formats number as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('uses custom decimal places', () => {
    expect(formatCurrency(100, 0)).toBe('$100');
  });

  it('uses custom locale', () => {
    const formatted = formatCurrency(1234.56, 2, 'es-ES');
    expect(formatted).toContain('1');
    expect(formatted).toContain('234');
    expect(formatted).toContain('56');
  });
});

describe('formatNumber', () => {
  it('formats number without currency symbol', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });

  it('formats with custom decimals', () => {
    expect(formatNumber(1234.567, 1)).toBe('1,234.6');
  });
});

describe('formatCurrencyWithSign', () => {
  it('formats without sign by default', () => {
    expect(formatCurrencyWithSign(100)).toBe('$100.00');
  });

  it('adds plus sign for positive values when enabled', () => {
    expect(formatCurrencyWithSign(100, true)).toBe('+$100.00');
  });

  it('does not add plus sign for negative values', () => {
    expect(formatCurrencyWithSign(-100, true)).toBe('-$100.00');
  });

  it('does not add plus sign for zero', () => {
    expect(formatCurrencyWithSign(0, true)).toBe('$0.00');
  });
});
