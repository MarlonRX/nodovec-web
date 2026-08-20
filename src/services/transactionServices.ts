// Servicios relacionados con transacciones
import type { Filters } from '@/schemas/tableSchema';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import { isDemoMode, filterTransactionsByDate } from '@/lib/demoUtils';
import { DEMO_TRANSACTIONS } from '@/data/demoData';
import type { ApiResponse } from './types';

// SERVICIOS DE TRANSACCIONES

function emptyPaginatedData() {
  return {
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
  };
}

/**
 * Obtener todas las transacciones del usuario.
 * En modo demo, retorna datos ficticios filtrados por fecha.
 */
export const getTransactions = async (filters?: Filters, token?: string | null): Promise<ApiResponse<any>> => {
  if (isDemoMode()) {
    try {
      const year = filters?.year || new Date().getFullYear();
      const month = filters?.month || new Date().getMonth() + 1;
      const filteredData = filterTransactionsByDate(DEMO_TRANSACTIONS, year, month);
      return {
        response: true,
        message: 'Transactions fetched (Demo Mode)',
        data: {
          ...emptyPaginatedData(),
          data: filteredData,
          from: filteredData.length > 0 ? 1 : null,
          to: filteredData.length > 0 ? filteredData.length : null,
          total: filteredData.length,
        },
      };
    } catch {
      return { response: false, message: 'Error filtering demo transactions', data: emptyPaginatedData() };
    }
  }

  return apiGet('transactions', { params: filters as Record<string, unknown>, token });
};

/**
 * Crear nueva transacción.
 * En modo demo, solo lectura.
 */
export const createTransaction = async (data: unknown, token?: string | null): Promise<ApiResponse<any>> => {
  if (isDemoMode()) {
    return { response: false, status: 403, message: 'Demo mode is read-only. Sign up to create transactions!', data: null };
  }
  return apiPost('transactions', data, { token });
};

/**
 * Actualizar transacción.
 * En modo demo, solo lectura.
 */
export const updateTransaction = async (uuid: string, data: unknown, token?: string | null): Promise<ApiResponse<any>> => {
  if (isDemoMode()) {
    return { response: false, status: 403, message: 'Demo mode is read-only. Sign up to update transactions!', data: null };
  }
  return apiPut(`transactions/${uuid}`, data, { token });
};

/**
 * Eliminar transacción.
 * En modo demo, solo lectura.
 */
export const deleteTransaction = async (uuid: string, token?: string | null): Promise<ApiResponse<any>> => {
  if (isDemoMode()) {
    return { response: false, status: 403, message: 'Demo mode is read-only. Sign up to delete transactions!', data: null };
  }
  return apiDelete(`transactions/${uuid}`, { token });
};

/**
 * Obtener totales (income, expense, net) para el mes/año seleccionado.
 * Calcula sobre TODAS las transacciones del período, no solo la página actual.
 */
export const getTransactionsTotals = async (filters?: Filters, token?: string | null): Promise<ApiResponse<any>> => {
  if (isDemoMode()) {
    try {
      const year = filters?.year || new Date().getFullYear();
      const month = filters?.month || new Date().getMonth() + 1;
      const filteredData = filterTransactionsByDate(DEMO_TRANSACTIONS, year, month);

      const totals = filteredData.reduce(
        (acc, curr) => {
          const amount = curr.amount || 0;
          if (curr.type === 'income') acc.income += amount;
          else acc.expense += amount;
          return acc;
        },
        { income: 0, expense: 0, net: 0 },
      );

      const fixedTotals = filteredData.reduce(
        (acc, curr) => {
          const amount = curr.amount || 0;
          if (curr.fixed) {
            if (curr.type === 'income') acc.income += amount;
            else acc.expense += amount;
          }
          return acc;
        },
        { income: 0, expense: 0 },
      );

      totals.net = totals.income - totals.expense;
      (totals as any).fixedIncome = fixedTotals.income;
      (totals as any).fixedExpense = fixedTotals.expense;

      return { response: true, message: 'Totals calculated (Demo Mode)', data: totals };
    } catch {
      return { response: false, message: 'Error calculating demo totals', data: { income: 0, expense: 0, net: 0 } };
    }
  }

  return apiGet('transactions/totals', { params: filters as Record<string, unknown>, token });
};

/**
 * Obtener TODAS las transacciones de un período (sin limitación de paginación).
 * Itera por páginas si es necesario y propaga los mismos filtros.
 */
export const getAllTransactionsForMonth = async (
  year: number,
  month: number,
  extraFilters?: { search?: string; type?: 'income' | 'expense'; category?: string },
  token?: string | null,
): Promise<ApiResponse<any>> => {
  if (isDemoMode()) {
    try {
      const filteredData = filterTransactionsByDate(DEMO_TRANSACTIONS, year, month);
      return { response: true, message: 'All transactions fetched (Demo Mode)', data: filteredData };
    } catch {
      return { response: false, message: 'Error filtering demo transactions', data: [] };
    }
  }

  try {
    const allTransactions: any[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const result = await getTransactions({
        year,
        month,
        page,
        ...(extraFilters?.search && { search: extraFilters.search }),
        ...(extraFilters?.type && { type: extraFilters.type }),
        ...(extraFilters?.category && { category: extraFilters.category }),
      }, token);

      if (result.response && result.data?.data && result.data.data.length > 0) {
        allTransactions.push(...result.data.data);
        hasMorePages = page < (result.data.last_page || 1);
        page++;
      } else {
        hasMorePages = false;
      }
    }

    return { response: true, message: 'All transactions fetched successfully', data: allTransactions };
  } catch {
    return { response: false, message: 'An unexpected error occurred', data: [] };
  }
};
