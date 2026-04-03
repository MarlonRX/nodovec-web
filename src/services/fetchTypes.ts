// Tipos de peticiones HTTP usando Axios (sin validación Zod)
import axios, { type AxiosResponse, type AxiosError } from 'axios';
import { API_CONFIG, APP_CONFIG, STORAGE_CONFIG } from '../config/api';

// Configurar instancia de axios con URL relativa única
// Todos los requests irán a /api (mismo origen)
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Buscar token en localStorage (donde se guarda después del login)
      const token = localStorage.getItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si el token expiró, limpiar localStorage
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.USER_KEY}`);
        localStorage.removeItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`);
        localStorage.removeItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.REFRESH_TOKEN_KEY}`);
        // Opcional: redirigir al login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Función helper para manejar errores
const handleError = (error: any): any => {
  if (axios.isAxiosError(error)) {
    return error;
  }
  return error;
};

// Función helper para manejar respuestas exitosas
const handleSuccess = (
  response: AxiosResponse
): AxiosResponse => {
  return response;
};

/**
 * GET - Obtener datos
 */
export const getFetch = async (
  endpoint: string, 
  params?: Record<string, any>
): Promise<AxiosResponse> => {
  try {
    const response = await axiosInstance.get(endpoint, { params });
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * POST - Crear/Enviar datos
 */
export const postFetch = async (
  endpoint: string, 
  data?: any
): Promise<AxiosResponse> => {
  try {
    const response = await axiosInstance.post(endpoint, data);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * PUT - Actualizar datos completamente
 */
export const putFetch = async (
  endpoint: string, 
  data?: any
): Promise<AxiosResponse> => {
  try {
    const response = await axiosInstance.put(endpoint, data);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * PATCH - Actualizar datos parcialmente
 */
export const patchFetch = async (
  endpoint: string, 
  data?: any
): Promise<AxiosResponse> => {
  try {
    const response = await axiosInstance.patch(endpoint, data);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * DELETE - Eliminar datos
 */
export const deleteFetch = async (
  endpoint: string
): Promise<AxiosResponse> => {
  try {
    const response = await axiosInstance.delete(endpoint);
    return handleSuccess(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * POST - Para autenticación (login)
 */
export const authFetch = async (
  endpoint: string, 
  credentials: any
): Promise<AxiosResponse> => {
  try {
    const response = await axiosInstance.post(endpoint, credentials);
    const tokenData = response.data || {};

    // Normalizar nombres de token (token | access_token) y almacenar refresh token
    const accessToken = tokenData.token || tokenData.access_token;
    const refreshToken = tokenData.refresh_token || tokenData.refreshToken;

    if (typeof window !== 'undefined') {
      if (accessToken) {
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`, accessToken);
      }

      if (refreshToken) {
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.REFRESH_TOKEN_KEY}`, refreshToken);
      }

      if (tokenData.user) {
        // Mapear nombre completo si existe first_name/last_name
        const user = tokenData.user;

        // Normalizar avatar: si backend devuelve "avatars/xxx.jpg" u "avatars/..." convertir a URL pública
        if (user.avatar && typeof user.avatar === 'string' && !/^https?:\/\//i.test(user.avatar)) {
          const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
          // asegurar que no dupliquemos 'storage/'
          const avatarPath = user.avatar.replace(/^\/*(storage\/)?/, '');
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
 * Verificar si hay token de autenticación
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`);
  return !!token;
};

/**
 * Obtener usuario actual del localStorage
 */
export const getCurrentUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.USER_KEY}`);
  if (!userData) return null;
  
  try {
    const parsedData = JSON.parse(userData);
    if (parsedData?.avatar && typeof parsedData.avatar === 'string' && !/^https?:\/\//i.test(parsedData.avatar)) {
      const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
      parsedData.avatar = `${base}/storage/${parsedData.avatar.replace(/^\/*(storage\/)?/, '')}`;
    }
    return parsedData;
  } catch {
    return null;
  }
};

// Exportar instancia de axios por si se necesita usar directamente
export { axiosInstance };
