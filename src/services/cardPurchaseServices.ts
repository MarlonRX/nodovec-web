import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { ApiResponse } from './types';

export const getCardPurchases = (cardUuid: string, params?: { page?: number }, token?: string | null): Promise<ApiResponse<any>> =>
  apiGet(`cards/${cardUuid}/purchases`, { params, token });

export const createCardPurchase = (cardUuid: string, data: unknown, token?: string | null): Promise<ApiResponse<any>> =>
  apiPost(`cards/${cardUuid}/purchases`, data, { token });

export const updateCardPurchase = (cardUuid: string, uuid: string, data: unknown, token?: string | null): Promise<ApiResponse<any>> =>
  apiPut(`cards/${cardUuid}/purchases/${uuid}`, data, { token });

export const deleteCardPurchase = (cardUuid: string, uuid: string, token?: string | null): Promise<ApiResponse<any>> =>
  apiDelete(`cards/${cardUuid}/purchases/${uuid}`, { token });

export const advanceInstallment = (cardUuid: string, uuid: string, token?: string | null): Promise<ApiResponse<any>> =>
  apiPost(`cards/${cardUuid}/purchases/${uuid}/advance`, {}, { token });

export const getActivePurchasesSummary = (token?: string | null): Promise<ApiResponse<any>> =>
  apiGet('cards/purchases/active-summary', { token });
