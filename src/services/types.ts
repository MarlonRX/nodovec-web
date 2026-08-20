/**
 * Contrato de respuesta unificado para todos los servicios.
 *
 * El backend (y los servicios en modo demo) responden siempre con la forma
 * `{ response, message, data }`. Estandarizar esto evita los shapes
 * inconsistentes que hoy conviven en el código (`data` a veces array, a veces
 * objeto paginado, con o sin `status`).
 */

/** Respuesta envolvente estándar de la API. */
export interface ApiResponse<T = unknown> {
  /** `true` cuando la operación fue exitosa. */
  response: boolean;
  /** Mensaje informativo o de error. */
  message: string;
  /** Payload de la respuesta (array, objeto paginado, entidad o null). */
  data: T;
  /** Código HTTP cuando está disponible. */
  status?: number;
}

/** Metadata de paginación estilo Laravel. */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
}

/** Respuesta paginada estilo Laravel. */
export interface PaginatedData<T> extends PaginationMeta {
  data: T[];
}

/** Respuesta envolvente de una colección paginada. */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
