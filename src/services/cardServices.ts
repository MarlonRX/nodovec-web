import { getFetch, postFetch, putFetch, deleteFetch } from './fetchTypes';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

export const getCards = async (params?: { page?: number; page_size?: number }) => {
  try {
    const response: AxiosResponse = await getFetch('cards', params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { response: false, message: error.response?.data?.message || 'Failed to fetch cards', data: null };
    }
    return { response: false, message: 'An unexpected error occurred', data: null };
  }
};

export const createCard = async (data: any) => {
  try {
    const response: AxiosResponse = await postFetch('cards', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { response: false, message: error.response?.data?.message || 'Failed to create card', data: null };
    }
    return { response: false, message: 'An unexpected error occurred', data: null };
  }
};

export const updateCard = async (uuid: string, data: any) => {
  try {
    const response: AxiosResponse = await putFetch(`cards/${uuid}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { response: false, message: error.response?.data?.message || 'Failed to update card', data: null };
    }
    return { response: false, message: 'An unexpected error occurred', data: null };
  }
};

export const deleteCard = async (uuid: string) => {
  try {
    const response: AxiosResponse = await deleteFetch(`cards/${uuid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { response: false, message: error.response?.data?.message || 'Failed to delete card', data: null };
    }
    return { response: false, message: 'An unexpected error occurred', data: null };
  }
};

// Get all cards (no pagination limit) for lookups
export const getAllCards = async () => {
  try {
    const response: AxiosResponse = await getFetch('cards', { page_size: 100 });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) return { response: false, message: error.response?.data?.message || 'Failed', data: null };
    return { response: false, message: 'An unexpected error occurred', data: null };
  }
};
