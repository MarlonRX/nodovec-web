/**
 * Demo mode utilities for CashPilot
 * Handles detection and management of demo vs real user modes
 */
import { STORAGE_CONFIG } from '../config/api';

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
export const getCurrentMode = (): "demo" | "authenticated1" => {
  return isDemoMode() ? "demo" : "authenticated1";
};

/**
 * Checks if user is authenticated
 * Looks for token in localStorage using STORAGE_CONFIG
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    const token = localStorage.getItem(tokenKey);
    return !!token;
  } catch {
    return false;
  }
};

/**
 * Gets auth token from localStorage using STORAGE_CONFIG
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    return localStorage.getItem(tokenKey);
  } catch {
    return null;
  }
};

/**
 * Sets auth token in localStorage using STORAGE_CONFIG
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  try {
    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    localStorage.setItem(tokenKey, token);
  } catch {
    console.error("Failed to set auth token");
  }
};

/**
 * Clears auth token from localStorage using STORAGE_CONFIG
 */
export const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;
  try {
    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    localStorage.removeItem(tokenKey);
  } catch {
    console.error("Failed to clear auth token");
  }
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
export const showDemoIndicator = (): boolean => {
  return isDemoMode();
};
