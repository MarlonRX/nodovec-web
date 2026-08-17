/**
 * Utilidad para guardar y recuperar preferencias del usuario
 * Almacena: idioma, moneda, tema
 */

export interface UserPreferences {
  language?: string;
  currency?: 'USD' | 'EUR' | 'COP';
  theme?: string;
}

const PREFERENCES_KEY = 'cash_pilot_preferences';

/**
 * Guardar todas las preferencias del usuario
 */
export function savePreferences(preferences: UserPreferences): void {
  try {
    if (typeof window === 'undefined') return;
    
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    
    // Disparar evento global para notificar cambios
    window.dispatchEvent(
      new CustomEvent('preferencesChanged', { detail: updated })
    );
  } catch (err) {
    console.error('Error saving preferences:', err);
  }
}

/**
 * Obtener todas las preferencias del usuario
 */
export function getPreferences(): UserPreferences {
  try {
    if (typeof window === 'undefined') return {};
    
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error('Error getting preferences:', err);
    return {};
  }
}

/**
 * Obtener una preferencia específica
 */
export function getPreference<K extends keyof UserPreferences>(
  key: K
): UserPreferences[K] | undefined {
  const prefs = getPreferences();
  return prefs[key];
}

/**
 * Limpiar todas las preferencias
 */
function clearPreferences(): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(PREFERENCES_KEY);
    
    window.dispatchEvent(
      new CustomEvent('preferencesChanged', { detail: {} })
    );
  } catch (err) {
    console.error('Error clearing preferences:', err);
  }
}
