import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { ApiResponse } from './types';

export const getCards = (params?: { page?: number; page_size?: number }, token?: string | null): Promise<ApiResponse<any>> =>
  apiGet('cards', { params, token });

export const createCard = (data: unknown, token?: string | null): Promise<ApiResponse<any>> =>
  apiPost('cards', data, { token });

export const updateCard = (uuid: string, data: unknown, token?: string | null): Promise<ApiResponse<any>> =>
  apiPut(`cards/${uuid}`, data, { token });

export const deleteCard = (uuid: string, token?: string | null): Promise<ApiResponse<any>> =>
  apiDelete(`cards/${uuid}`, { token });

// Get all cards (no pagination limit) for lookups
export const getAllCards = (token?: string | null): Promise<ApiResponse<any>> =>
  apiGet('cards', { params: { page_size: 100 }, token });
