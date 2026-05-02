import { API_CONFIG } from "../config/api";
import { authStore } from "../store/auth";

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | string | FormData;
}

/**
 * Hace una solicitud HTTP con token de autenticación automático
 */
export async function authenticatedFetch(
  url: string,
  options: FetchOptions = {}
) {
  const token = authStore.getToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  // Agregar token si existe
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Convertir body si es un objeto
  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: body as BodyInit,
  });

  // Si retorna 401, el usuario no está autenticado
  if (response.status === 401) {
    authStore.logout();
    window.location.href = "/login";
  }

  return response;
}

/**
 * Obtiene la URL completa de la API
 */
export function getApiUrl(path: string): string {
  const baseUrl = API_CONFIG.BASE_URL || "";
  return `${baseUrl}${path}`;
}
