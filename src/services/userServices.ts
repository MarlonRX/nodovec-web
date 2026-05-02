// Servicios relacionados con usuarios
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/userInterfaces';
import { getFetch, postFetch, putFetch, deleteFetch, authFetch } from './fetchTypes';
import { STORAGE_CONFIG, API_CONFIG } from '../config/api';
import { z } from 'zod';

const TokenResponseSchema = z.object({
  message: z.string().optional(),
  token: z.string().optional(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  refreshToken: z.string().optional(),
  user: z.record(z.string(), z.unknown()).optional(),
});

type TokenResponse = z.infer<typeof TokenResponseSchema>;

const MessageResponseSchema = z.object({
  message: z.string(),
});

type MessageResponse = z.infer<typeof MessageResponseSchema>;

// SERVICIOS DE AUTENTICACIÓN

/**
 * Iniciar sesión
 */
export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await authFetch<TokenResponse>('auth/login', credentials);
    const payload = response.data;
    // Normalizar a forma { response: true, status, message, data }
    return { response: true, status: response.status || 200, message: payload?.message || 'Login successful', data: payload };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    return {
      response: false,
      status: err?.response?.status || 500,
      message: err?.response?.data?.message || err?.message || 'Login failed',
      data: null,
    };
  }
};

/**
 * Registrar nuevo usuario
 */
export const registerUser = async (userData: RegisterData) => {
  try {
    const response = await postFetch<MessageResponse>('auth/register', userData);
    const payload = response.data;
    return { response: true, status: response.status || 200, message: payload?.message || 'Registered', data: payload };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    return {
      response: false,
      status: err?.response?.status || 500,
      message: err?.response?.data?.message || err?.message || 'Registration failed',
      data: null,
    };
  }
};

/**
 * Cerrar sesión
 */
export const logoutUser = async () => {
  try {
    const response = await postFetch<MessageResponse>('auth/logout');
    const payload = response.data;
    return { response: true, status: response.status || 200, message: payload?.message || 'Logged out', data: payload };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    return {
      response: false,
      status: err?.response?.status || 500,
      message: err?.response?.data?.message || err?.message || 'Logout failed',
      data: null,
    };
  }
};

/**
 * Obtener perfil del usuario actual
 */
export const getUserProfile = async () => {
  try {
    const response = await getFetch<{ user?: Record<string, unknown>; message?: string }>('auth/me');
    const payload = response.data;
    return { response: true, status: response.status || 200, message: payload?.message || 'Profile fetched', data: payload?.user || payload };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    return {
      response: false,
      status: err?.response?.status || 500,
      message: err?.response?.data?.message || err?.message || 'Failed to fetch profile',
      data: null,
    };
  }
};

/**
 * Refrescar token de autenticación
 */
export const refreshToken = async () => {
  try {
    if (typeof window === 'undefined') throw new Error('No refresh token available');
    const refresh = localStorage.getItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.REFRESH_TOKEN_KEY}`);
    if (!refresh) return { response: false, status: 401, message: 'No refresh token', data: null };

    const response = await postFetch<TokenResponse>('auth/refresh', { refreshToken: refresh });
    const payload = response.data;

    // Actualizar token y usuario en localStorage si vienen
    if (payload) {
      const newToken = payload.token || payload.access_token;
      const newRefresh = payload.refresh_token || payload.refreshToken;
      if (newToken) {
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`, newToken);
      }
      if (newRefresh) {
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.REFRESH_TOKEN_KEY}`, newRefresh);
      }
      if (payload.user) {
        const user = payload.user as Record<string, unknown>;
        // Normalizar avatar si viene como "avatars/xxx"
        if (user.avatar && typeof user.avatar === 'string' && !/^https?:\/\//i.test(user.avatar)) {
          const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
          const avatarPath = user.avatar.replace(/^\/*(storage\/)?/, '');
          user.avatar = `${base}/storage/${avatarPath}`;
        }
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
        const mapped = { ...user, name: name || user.name };
        localStorage.setItem(`${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.USER_KEY}`, JSON.stringify(mapped));
      }
    }

    return { response: true, status: response.status || 200, message: payload?.message || 'Token refreshed', data: payload };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
    return {
      response: false,
      status: err?.response?.status || 500,
      message: err?.response?.data?.message || err?.message || 'Token refresh failed',
      data: null,
    };
  }
};

// SERVICIOS DE USUARIOS (CRUD)

/**
 * Obtener todos los usuarios (solo admin)
 */
export const getAllUsers = async (params?: { page?: number; per_page?: number; search?: string }) => {
  try {
    return await getFetch('users', params);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener usuario por UUID
 */
export const getUserByUuid = async (uuid: string) => {
  try {
    return await getFetch(`users/${uuid}`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Crear nuevo usuario (solo admin)
 */
export const createUser = async (userData: Omit<RegisterData, 'password_confirmation'> & { role_id: number }) => {
  try {
    return await postFetch('users', userData);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Actualizar usuario
 */
export const updateUser = async (uuid: string, userData: Partial<User>) => {
  try {
    return await putFetch(`users/${uuid}`, userData);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Subir avatar de usuario (multipart/form-data)
 * Usa axiosInstance directamente para asegurarnos de enviar multipart correctamente
 */
import { axiosInstance } from "./fetchTypes";

export const uploadUserAvatar = async (uuid: string, file: File) => {
  try {
    const form = new FormData();
    form.append('avatar', file);
    const response = await axiosInstance.post(`users/${uuid}/avatar`, form, {
      headers: {
        // dejar que el browser/axios gestione el boundary, pero declarar multipart
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error: any) {
    // Estándar: devolver el error estructurado para el caller
    return {
      response: false,
      message: error?.response?.data?.message || error?.message || String(error),
      error,
    };
  }
};

/**
 * Cambiar estado del usuario (activar/desactivar)
 */
export const toggleUserStatus = async (uuid: string) => {
  try {
    return await postFetch(`users/${uuid}/status`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

// SERVICIOS DE ROLES

/**
 * Obtener todos los roles
 */
export const getAllRoles = async () => {
  try {
    return await getFetch('roles/get-all');
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Obtener rol por UUID
 */
export const getRoleByUuid = async (uuid: string) => {
  try {
    return await getFetch(`roles/${uuid}`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Crear nuevo rol
 */
export const createRole = async (roleData: { name: string; description?: string }) => {
  try {
    return await postFetch('roles', roleData);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Actualizar rol
 */
export const updateRole = async (uuid: string, roleData: { name?: string; description?: string }) => {
  try {
    return await putFetch(`roles/${uuid}`, roleData);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};

/**
 * Cambiar estado del rol
 */
export const toggleRoleStatus = async (uuid: string) => {
  try {
    return await postFetch(`roles/${uuid}/status`);
  } catch (error) {
    return {
      res: false,
      message: error,
    };
  }
};
