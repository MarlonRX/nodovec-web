// Servicios relacionados con transacciones
import { Filters } from '@/schemas/tableSchema';
import { getFetch, postFetch, putFetch, deleteFetch } from './fetchTypes';
import type { AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { isDemoMode, filterTransactionsByDate } from '@/lib/demoUtils';
import { DEMO_TRANSACTIONS } from '@/data/demoData';
import { id } from 'zod/v4/locales';

// SERVICIOS DE TRANSACCIONES

/**
 * Obtener todas las transacciones del usuario
 * En modo demo, retorna datos fictos filtrados por fecha
 */
export const getTransactions = async (filters?: Filters) => {
  // Modo demo: retornar datos fictos
  if (isDemoMode()) {
    try {
      const year = filters?.year || new Date().getFullYear();
      const month = filters?.month || new Date().getMonth() + 1;
      
      const filteredData = filterTransactionsByDate(DEMO_TRANSACTIONS, year, month);
      
      return {
        response: true,
        message: 'Transactions fetched (Demo Mode)',
        data: {
          current_page: 1,
          data: filteredData,
          first_page_url: '/',
          from: filteredData.length > 0 ? 1 : null,
          last_page: 1,
          last_page_url: '/',
          links: [],
          next_page_url: null,
          path: '/',
          per_page: 10,
          prev_page_url: null,
          to: filteredData.length > 0 ? filteredData.length : null,
          total: filteredData.length,
        },
      };
    } catch (error) {
      return {
        response: false,
        message: 'Error filtering demo transactions',
        data: {
          current_page: 1,
          data: [],
          first_page_url: '/',
          from: null,
          last_page: 1,
          last_page_url: '/',
          links: [],
          next_page_url: null,
          path: '/',
          per_page: 10,
          prev_page_url: null,
          to: null,
          total: 0,
        },
      };
    }
  }

  // Modo autenticado: llamar a API real
  try {
    const response: AxiosResponse = await getFetch('transactions', filters);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        message: error.response?.data?.message || 'Failed to fetch transactions',
        data: {
          current_page: 1,
          data: [],
          first_page_url: '/',
          from: null,
          last_page: 1,
          last_page_url: '/',
          links: [],
          next_page_url: null,
          path: '/',
          per_page: 10,
          prev_page_url: null,
          to: null,
          total: 0,
        },
      };
    }
    return {
      response: false,
      message: 'An unexpected error occurred',
      data: {
        current_page: 1,
        data: [],
        first_page_url: '/',
        from: null,
        last_page: 1,
        last_page_url: '/',
        links: [],
        next_page_url: null,
        path: '/',
        per_page: 10,
        prev_page_url: null,
        to: null,
        total: 0,
      },
    };
  }
};

/**
 * Obtener transacción por ID
 */
export const getTransactionById = async (id: number) => {
  try {
    const response: AxiosResponse = await getFetch(`transactions/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch transaction',
        data: null,
      };
    }
    return {
      response: false,
      status: 500,
      message: 'An unexpected error occurred',
      data: null,
    };
  }
};

/**
 * Crear nueva transacción
 * En modo demo, muestra un mensaje informativo
 */
export const createTransaction = async (data: any) => {
  // Modo demo: solo lectura, no permitir crear
  if (isDemoMode()) {
    return {
      response: false,
      status: 403,
      message: 'Demo mode is read-only. Sign up to create transactions!',
      data: null,
    };
  }

  // Modo autenticado: crear en API real
  try {
    const response: AxiosResponse = await postFetch('transactions', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to create transaction',
        data: null,
      };
    }
    return {
      response: false,
      status: 500,
      message: 'An unexpected error occurred',
      data: null,
    };
  }
};

/**
 * Actualizar transacción
 * En modo demo, muestra un mensaje informativo
 */
export const updateTransaction = async (id: number, data: any) => {
  // Modo demo: solo lectura, no permitir actualizar
  if (isDemoMode()) {
    return {
      response: false,
      status: 403,
      message: 'Demo mode is read-only. Sign up to update transactions!',
      data: null,
    };
  }

  // Modo autenticado: actualizar en API real
  try {
    const response: AxiosResponse = await putFetch(`transactions/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to update transaction',
        data: null,
      };
    }
    return {
      response: false,
      status: 500,
      message: 'An unexpected error occurred',
      data: null,
    };
  }
};

/**
 * Eliminar transacción
 * En modo demo, muestra un mensaje informativo
 */
export const deleteTransaction = async (uuid: string) => {
  // Modo demo: solo lectura, no permitir eliminar
  if (isDemoMode()) {
    return {
      response: false,
      status: 403,
      message: 'Demo mode is read-only. Sign up to delete transactions!',
      data: null,
    };
  }

  // Modo autenticado: eliminar en API real
  try {
    const response: AxiosResponse = await deleteFetch(`transactions/${uuid}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to delete transaction',
        data: null,
      };
    }
    return {
      response: false,
      status: 500,
      message: 'An unexpected error occurred',
      data: null,
    };
  }
};

/**
 * Obtener transacciones por tipo (income/expense)
 */
export const getTransactionsByType = async (type: 'income' | 'expense', params?: { page?: number; per_page?: number }) => {
  try {
    const response: AxiosResponse = await getFetch(`transactions/type/${type}`, params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch transactions',
        data: null,
      };
    }
    return {
      response: false,
      status: 500,
      message: 'An unexpected error occurred',
      data: null,
    };
  }
};

/**
 * Obtener transacciones por categoría
 */
export const getTransactionsByCategory = async (categoryId: number, params?: { page?: number; per_page?: number }) => {
  try {
    const response: AxiosResponse = await getFetch(`transactions/category/${categoryId}`, params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        response: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch transactions',
        data: null,
      };
    }
    return {
      response: false,
      status: 500,
      message: 'An unexpected error occurred',
      data: null,
    };
  }
};