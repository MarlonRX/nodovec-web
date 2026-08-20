import { formatNumber } from "@/lib/currencyFormatter";
import type { Language } from "@/i18n";
import { translate } from "@/i18n";

/**
 * Constantes y helpers compartidos del módulo de transacciones.
 */

export interface CategoryColors {
  bg: string;
  text: string;
  border: string;
}

const CATEGORY_COLOR_MAP: Record<string, CategoryColors> = {
  // Income categories
  salary: { bg: 'rgba(52, 168, 83, 0.12)', text: '#34A853', border: 'rgba(52, 168, 83, 0.25)' },
  freelance: { bg: 'rgba(25, 118, 210, 0.12)', text: '#1976D2', border: 'rgba(25, 118, 210, 0.25)' },
  investment: { bg: 'rgba(123, 31, 162, 0.12)', text: '#7B1FA2', border: 'rgba(123, 31, 162, 0.25)' },
  bonus: { bg: 'rgba(251, 188, 4, 0.12)', text: '#FBC004', border: 'rgba(251, 188, 4, 0.25)' },
  other_income: { bg: 'rgba(76, 175, 80, 0.12)', text: '#4CAF50', border: 'rgba(76, 175, 80, 0.25)' },
  // Expense categories
  food: { bg: 'rgba(229, 57, 53, 0.12)', text: '#E53935', border: 'rgba(229, 57, 53, 0.25)' },
  transportation: { bg: 'rgba(245, 127, 23, 0.12)', text: '#F57F17', border: 'rgba(245, 127, 23, 0.25)' },
  utilities: { bg: 'rgba(194, 24, 91, 0.12)', text: '#C2185B', border: 'rgba(194, 24, 91, 0.25)' },
  entertainment: { bg: 'rgba(142, 36, 170, 0.12)', text: '#8E24AA', border: 'rgba(142, 36, 170, 0.25)' },
  healthcare: { bg: 'rgba(211, 47, 47, 0.12)', text: '#D32F2F', border: 'rgba(211, 47, 47, 0.25)' },
  shopping: { bg: 'rgba(63, 81, 181, 0.12)', text: '#3F51B5', border: 'rgba(63, 81, 181, 0.25)' },
  rent: { bg: 'rgba(0, 121, 107, 0.12)', text: '#00796B', border: 'rgba(0, 121, 107, 0.25)' },
  other_expense: { bg: 'rgba(158, 158, 158, 0.12)', text: '#9E9E9E', border: 'rgba(158, 158, 158, 0.25)' },
};

const DEFAULT_COLOR: CategoryColors = {
  bg: 'rgba(158, 158, 158, 0.12)',
  text: '#9E9E9E',
  border: 'rgba(158, 158, 158, 0.25)',
};

export function getCategoryColor(category: string): CategoryColors {
  return CATEGORY_COLOR_MAP[category] || DEFAULT_COLOR;
}

/** Lista de claves de categoría, en orden de presentación. */
export const CATEGORY_KEYS = [
  'salary',
  'freelance',
  'investment',
  'bonus',
  'other_income',
  'food',
  'transportation',
  'utilities',
  'entertainment',
  'healthcare',
  'shopping',
  'rent',
  'other_expense',
] as const;

/** Formatea un monto sin símbolo de moneda (el símbolo se agrega en el JSX). */
export function formatAmount(amount: number): string {
  return formatNumber(amount, 2);
}

/** Opciones de categoría ya traducidas para un idioma dado. */
export function buildCategoryOptions(lang: Language): Array<{ value: string; label: string }> {
  const t = (key: string) => translate(key, lang);
  return [
    { value: '', label: t('transactionForm.allCategories') },
    ...CATEGORY_KEYS.map((key) => ({ value: key, label: t(`transactionForm.category${snakeToPascal(key)}`) })),
  ];
}

function snakeToPascal(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
