import { getFetch, postFetch, putFetch, deleteFetch } from './fetchTypes';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

export const getCardPurchases = async (cardUuid: string, params?: { page?: number }) => {
  try {
    const response: AxiosResponse = await getFetch(`cards/${cardUuid}/purchases`, params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || 'Failed to fetch purchases', data: null };
    return { response: false, message: 'Unexpected error', data: null };
  }
};

export const createCardPurchase = async (cardUuid: string, data: any) => {
  try {
    const response: AxiosResponse = await postFetch(`cards/${cardUuid}/purchases`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || 'Failed to create purchase', data: null };
    return { response: false, message: 'Unexpected error', data: null };
  }
};

export const updateCardPurchase = async (cardUuid: string, uuid: string, data: any) => {
  try {
    const response: AxiosResponse = await putFetch(`cards/${cardUuid}/purchases/${uuid}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || 'Failed to update purchase', data: null };
    return { response: false, message: 'Unexpected error', data: null };
  }
};

export const deleteCardPurchase = async (cardUuid: string, uuid: string) => {
  try {
    const response: AxiosResponse = await deleteFetch(`cards/${cardUuid}/purchases/${uuid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || 'Failed to delete purchase', data: null };
    return { response: false, message: 'Unexpected error', data: null };
  }
};

export const advanceInstallment = async (cardUuid: string, uuid: string) => {
  try {
    const response: AxiosResponse = await postFetch(`cards/${cardUuid}/purchases/${uuid}/advance`, {});
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || 'Failed to advance installment', data: null };
    return { response: false, message: 'Unexpected error', data: null };
  }
};

export const getActivePurchasesSummary = async () => {
  try {
    const response: AxiosResponse = await getFetch('cards/purchases/active-summary');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || 'Failed to fetch summary', data: [] };
    return { response: false, message: 'Unexpected error', data: [] };
  }
};
