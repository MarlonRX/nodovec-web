import { API_CONFIG, getBackendUrl } from "@/config/api";
import { authStore } from "@/store/auth";
import type { ApiResponse } from "./types";

/**
 * Cliente HTTP agnóstico al entorno (servidor/cliente).
 *
 * Usa `fetch` nativo (disponible tanto en Node como en el navegador) y unifica
 * el contrato de respuesta en `ApiResponse<T>`. En el servidor el token se
 * recibe explícitamente (desde `Astro.cookies`); en el cliente se resuelve
 * desde `authStore`. Así los servicios funcionan igual en SSR y en el cliente.
 */

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, unknown>;
  token?: string | null;
}

function resolveToken(token?: string | null): string | null {
  if (token) return token;
  if (typeof window !== 'undefined') return authStore.getToken();
  return null;
}

export async function apiFetch<T = unknown>(
  path: string,
  { method = 'GET', body, params, token }: ApiFetchOptions = {},
): Promise<ApiResponse<T>> {
  const baseUrl = getBackendUrl().replace(/\/$/, '');
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${API_CONFIG.API_ENDPOINT}${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const authToken = resolveToken(token);
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { response: false, message: 'Network error', data: null as unknown as T };
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    return {
      response: false,
      status: response.status,
      message: (payload && typeof (payload as any).message === 'string')
        ? (payload as any).message
        : `Request failed (${response.status})`,
      data: ((payload && 'data' in (payload as any)) ? (payload as any).data : null) as T,
    };
  }

  const payload = await response.json().catch(() => null);

  // El backend envuelve las respuestas en `{ response, message, data }`.
  if (payload && typeof payload === 'object' && 'response' in payload) {
    return payload as ApiResponse<T>;
  }

  return {
    response: true,
    status: response.status,
    message: (payload && typeof (payload as any).message === 'string')
      ? (payload as any).message
      : 'OK',
    data: (payload !== null ? payload : undefined) as T,
  };
}

type RequestOptions = Omit<ApiFetchOptions, 'method' | 'body'>;

export function apiGet<T = unknown>(path: string, options: RequestOptions = {}) {
  return apiFetch<T>(path, { ...options, method: 'GET' });
}

export function apiPost<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}) {
  return apiFetch<T>(path, { ...options, method: 'POST', body });
}

export function apiPut<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}) {
  return apiFetch<T>(path, { ...options, method: 'PUT', body });
}

export function apiDelete<T = unknown>(path: string, options: RequestOptions = {}) {
  return apiFetch<T>(path, { ...options, method: 'DELETE' });
}
