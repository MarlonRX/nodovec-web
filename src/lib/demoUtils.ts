/**
 * Demo mode utilities for NodoVec
 * Handles detection and management of demo vs real user modes
 */
import { authStore } from '../store/auth';

/**
 * Detects if the current mode is demo mode
 * Based on URL or query parameter
 */
export const isDemoMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.location.pathname.includes("/demo");
};

/**
 * Gets the current mode type
 */
const getCurrentMode = (): "demo" | "authenticated1" => {
  return isDemoMode() ? "demo" : "authenticated1";
};

/**
 * Checks if user is authenticated
 * IMPORTANTE: Usa authStore como source of truth unificado
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return authStore.isAuthenticated();
};

/**
 * Gets auth token
 * IMPORTANTE: Usa authStore como source of truth unificado
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return authStore.getToken();
};

/**
 * Sets auth token (use authStore.login instead)
 * IMPORTANTE: Usa authStore como source of truth unificado
 */
const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  // Esta función está deprecada - usar authStore.login() en su lugar
  console.warn("setAuthToken is deprecated, use authStore.login() instead");
};

/**
 * Clears auth token (use authStore.logout instead)
 * IMPORTANTE: Usa authStore como source of truth unificado
 */
const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;
  authStore.logout();
};

/**
 * Filters transactions by year and month
 */
export const filterTransactionsByDate = (
  transactions: any[],
  year: number,
  month: number
): any[] => {
  return transactions.filter((txn) => {
    const date = new Date(txn.date || txn.transaction_date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
};

/**
 * Shows demo mode indicator (can be used in UI)
 */
const showDemoIndicator = (): boolean => {
  return isDemoMode();
};
