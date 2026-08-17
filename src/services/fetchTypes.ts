// Tipos de peticiones HTTP usando Axios (sin validación Zod)
import axios, { type AxiosResponse, type AxiosError } from 'axios';
import { API_CONFIG, APP_CONFIG, STORAGE_CONFIG } from '../config/api';
import { authStore } from '../store/auth';

// Configurar instancia de axios con URL base correcta del backend
// Usa la URL calculada dinámicamente según el entorno
const axiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_ENDPOINT}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Interceptor para agregar token automáticamente
// IMPORTANTE: Lee del authStore (source of truth) en lugar de localStorage directamente
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Obtener token del authStore (source of truth unificado)
      const token = authStore.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => {
    // Envolver el error en un Error object válido si es necesario
    const validError = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(validError);
  }
);

// Interceptor para manejar respuestas y errores globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    // Envolver el error en un Error object válido si es necesario
    const validError = error instanceof Error ? error : new Error(String(error));
    
    // Si el token expiró, usar authStore.logout() en lugar de limpiar localStorage directamente
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        authStore.logout(); // Esto limpia TODO consistentemente
        // Opcional: redirigir al login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(validError);
  }
);

// Función helper para manejar errores
const handleError = (error: any): Error => {
  // Asegurar que siempre lanzamos un Error object válido
  if (error instanceof Error) {
    return error;
  }
  if (axios.isAxiosError(error)) {
    return error;
  }
  // Si es cualquier otra cosa, crear un Error valido
  return new Error(String(error) || 'Unknown error occurred');
};

// Función helper para manejar respuestas exitosas
const handleSuccess = (
  response: AxiosResponse
): AxiosResponse => {
  return response;
};

/**
 * Perform an authenticated GET request.
 * @param endpoint - API endpoint path (e.g., 'transactions')
 * @param params - Optional query parameters
 * @returns Axios response
 * @throws Error on network or HTTP errors
 */
export const getFetch = async <T = unknown>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosInstance.get<T>(endpoint, { params });
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Perform an authenticated POST request.
 * @param endpoint - API endpoint path
 * @param data - Request body payload
 * @returns Axios response
 * @throws Error on network or HTTP errors
 */
export const postFetch = async <T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosInstance.post<T>(endpoint, data);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Perform an authenticated PUT request.
 * @param endpoint - API endpoint path
 * @param data - Request body payload
 * @returns Axios response
 * @throws Error on network or HTTP errors
 */
export const putFetch = async <T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosInstance.put<T>(endpoint, data);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * PATCH - Actualizar datos parcialmente
 */
const patchFetch = async <T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosInstance.patch<T>(endpoint, data);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Perform an authenticated DELETE request.
 * @param endpoint - API endpoint path
 * @returns Axios response
 * @throws Error on network or HTTP errors
 */
export const deleteFetch = async <T = unknown>(
  endpoint: string
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosInstance.delete<T>(endpoint);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Perform an authentication POST request and persist tokens to storage.
 * @param endpoint - Auth endpoint path (e.g., 'auth/login')
 * @param credentials - Login credentials object
 * @returns Axios response with token data
 * @throws Error on invalid credentials or network failure
 */
export const authFetch = async <T extends Record<string, unknown> = Record<string, unknown>>(
  endpoint: string,
  credentials: unknown
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosInstance.post<T>(endpoint, credentials);
    const tokenData = response.data || ({} as Record<string, unknown>);

    // Normalizar nombres de token (token | access_token) y almacenar refresh token
    const accessToken = (tokenData as Record<string, unknown>).token || (tokenData as Record<string, unknown>).access_token;
    const refreshToken = (tokenData as Record<string, unknown>).refresh_token || (tokenData as Record<string, unknown>).refreshToken;

    if (typeof window !== 'undefined') {
      if (accessToken) {
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`, String(accessToken));
      }

      if (refreshToken) {
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.REFRESH_TOKEN_KEY}`, String(refreshToken));
      }

      if ((tokenData as Record<string, unknown>).user) {
        // Mapear nombre completo si existe first_name/last_name
        const user = (tokenData as Record<string, unknown>).user as Record<string, unknown>;

        // Normalizar avatar: si backend devuelve "avatars/xxx.jpg" u "avatars/..." convertir a URL pública
        if (user.avatar && typeof user.avatar === 'string' && !/^https?:\/\//i.test(user.avatar)) {
          const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
          // asegurar que no dupliquemos 'storage/'
          const avatarPath = String(user.avatar).replace(/^\/*(storage\/)?/, '');
          user.avatar = `${base}/storage/${avatarPath}`;
        }

        const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
        const mapped = { ...user, name: name || user.name };
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.USER_KEY}`, JSON.stringify(mapped));
      }
    }

    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Check if the user is currently authenticated.
 * Uses authStore as the source of truth.
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return authStore.isAuthenticated();
};

/**
 * Get the currently authenticated user.
 * Uses authStore as the source of truth.
 * @returns User object or null if not authenticated
 */
const getCurrentUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const user = authStore.getUser();
  return user || null;
};

// Exportar instancia de axios por si se necesita usar directamente
export { axiosInstance };
