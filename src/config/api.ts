// Configuración de la API para CashPilot Frontend
// Este archivo centraliza todas las configuraciones relacionadas con la API

// Detectar URL base del backend EN TIEMPO DE EJECUCIÓN
export function getBackendUrl(): string {
  // Solo en el navegador (cliente)
  if (typeof window === 'undefined') {
    return 'http://backend:8080'; // SSR fallback para servidor
  }

  const envUrl = import.meta.env.PUBLIC_API_BASE_URL;
  const hostname = window.location.hostname;
  
  // Si PUBLIC_API_BASE_URL contiene localhost/127.0.0.1 pero estamos en otro host,
  // construir URL dinámicamente (estamos en producción)
  if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Estamos en producción, usar mismo dominio que el frontend
      return `${window.location.protocol}//${window.location.host}`;
    }
  }
  
  // En todos los otros casos, usar PUBLIC_API_BASE_URL tal cual
  return envUrl;
}

console.log('API Base URL:', getBackendUrl());

export const API_CONFIG = {
  // URL base se calcula dinámicamente
  get BASE_URL(): string {
    return getBackendUrl();
  },
  
  // Endpoint base de la API
  API_ENDPOINT: '/api',
  
  // Timeout para las peticiones
  TIMEOUT: parseInt(import.meta.env.PUBLIC_API_TIMEOUT) || 30000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  
  // Endpoints de autenticación
  AUTH_ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/me',
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  }
} as const;

export const APP_CONFIG = {
  NAME: import.meta.env.PUBLIC_APP_NAME || 'CashPilot',
  VERSION: import.meta.env.PUBLIC_APP_VERSION || '1.0.0',
  DEV_MODE: import.meta.env.PUBLIC_DEV_MODE === 'true',
} as const;

export const STORAGE_CONFIG = {
  PREFIX: import.meta.env.PUBLIC_STORAGE_PREFIX || 'cashpilot_',
  TOKEN_KEY: import.meta.env.PUBLIC_TOKEN_STORAGE_KEY || 'auth_token',
  REFRESH_TOKEN_KEY: import.meta.env.PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'refresh_token',
  USER_KEY: import.meta.env.PUBLIC_USER_STORAGE_KEY || 'user_data',
} as const;

// Función helper para construir URLs completas de la API
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getBackendUrl().replace(/\/$/, ''); // Remove trailing slash
  const apiEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${API_CONFIG.API_ENDPOINT}${apiEndpoint}`;
}

// Función helper para obtener headers con autenticación
export function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS } as Record<string, string>;
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}
