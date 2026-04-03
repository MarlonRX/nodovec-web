// Store para autenticación del usuario
export interface AuthUser {
  id?: number;
  uuid: string;
  email: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  address: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  avatar?: string; // URL or storage path returned by backend
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "cash_pilot_auth";
const COOKIE_NAME = "auth_token";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getInitialState(): AuthState {
  if (typeof window === "undefined") {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }

  // First try to get from cookie
  const tokenFromCookie = getCookie(COOKIE_NAME);
  if (tokenFromCookie) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token === tokenFromCookie) {
          return parsed;
        }
      } catch {}
    }
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);

      // Normalize avatar URL in stored user if necessary
      if (parsed?.user?.avatar && typeof parsed.user.avatar === 'string' && !/^https?:\/\//i.test(parsed.user.avatar)) {
        const base = (typeof window !== 'undefined' && window.location) ? `${window.location.protocol}//${window.location.host}` : '';
        parsed.user.avatar = `${base}/storage/${parsed.user.avatar.replace(/^\/*(storage\/)?/, '')}`;
      }

      // If we have data in localStorage but no cookie, clear it
      if (!tokenFromCookie) {
        localStorage.removeItem(STORAGE_KEY);
        return {
          token: null,
          user: null,
          isAuthenticated: false,
        };
      }
      return parsed;
    } catch {
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };
    }
  }

  return {
    token: null,
    user: null,
    isAuthenticated: false,
  };
}

// Estado global (simula una tienda)
let authState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};
let hydratedFromClient = false;

// Listeners para cambios
const listeners: Set<(state: AuthState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(authState));
}

function ensureClientHydration() {
  if (hydratedFromClient || typeof window === "undefined") return;
  authState = getInitialState();
  hydratedFromClient = true;
}

function saveToLocalStorage() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }
}

export const authStore = {
  // Obtener estado actual
  getState(): AuthState {
    ensureClientHydration();
    return authState;
  },

  // Login - guardar token y usuario
  login(token: string, user: AuthUser) {
    // Normalizar avatar si viene relativo
    if (user?.avatar && typeof user.avatar === 'string' && !user.avatar.startsWith('http')) {
      const base = (typeof window !== 'undefined' && window.location) ? `${window.location.protocol}//${window.location.host}` : '';
      user.avatar = `${base}/storage/${user.avatar.replace(/^\/*(storage\/)?/, '')}`;
    }

    authState = {
      token,
      user,
      isAuthenticated: true,
    };
    hydratedFromClient = true;
    saveToLocalStorage();
    setCookie(COOKIE_NAME, token);
    notifyListeners();
  },

  // Register - igual que login (después del registro, inicia sesión)
  register(token: string, user: AuthUser) {
    this.login(token, user);
  },

  // Logout - limpiar estado
  logout() {
    authState = {
      token: null,
      user: null,
      isAuthenticated: false,
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      deleteCookie(COOKIE_NAME);
    }
    hydratedFromClient = true;
    notifyListeners();
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    ensureClientHydration();
    return authState.isAuthenticated && authState.token !== null;
  },

  // Obtener token
  getToken(): string | null {
    ensureClientHydration();
    return authState.token;
  },

  // Obtener usuario
  getUser(): AuthUser | null {
    ensureClientHydration();
    return authState.user;
  },

  // Subscribirse a cambios
  subscribe(listener: (state: AuthState) => void): () => void {
    ensureClientHydration();
    listeners.add(listener);
    listener(authState);
    return () => {
      listeners.delete(listener);
    };
  },

  // Actualizar parcialmente el usuario autenticado (por ejemplo: avatar)
  updateUser(partial: Partial<AuthUser>) {
    if (!authState.user) return;
    authState.user = { ...authState.user, ...partial } as AuthUser;
    saveToLocalStorage();
    notifyListeners();
  }
};
