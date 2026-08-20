import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getTransactions, getTransactionsTotals } from "@/services/transactionServices";
import {
  FiltersSchema,
  TransactionPaginatedResponseSchema,
  type Transaction,
} from "@/schemas/tableSchema";
import { translate, getCurrentLanguage } from "@/i18n";

export interface TransactionTotals {
  income: number;
  expense: number;
  net: number;
}

export interface FixedTotals {
  income: number;
  expense: number;
}

export interface TransactionsInitialData {
  data: Transaction[];
  totalPages: number;
  totalCount: number;
}

interface UseTransactionsDataParams {
  selectedYear: string;
  selectedMonth: string;
  currentPage: number;
  refreshTrigger: number;
  debouncedSearch: string;
  filterType: string;
  filterCategory: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  itemsPerPage: number;
  initialData?: TransactionsInitialData | null;
}

interface UseTransactionsDataResult {
  data: Transaction[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalCount: number;
  totals: TransactionTotals;
  fixedTotals: FixedTotals;
}

/**
 * Carga las transacciones (paginadas) y sus totales para el período y filtros
 * indicados. Centraliza el fetching que antes vivía dentro del componente.
 */
export function useTransactionsData({
  selectedYear,
  selectedMonth,
  currentPage,
  refreshTrigger,
  debouncedSearch,
  filterType,
  filterCategory,
  sortField,
  sortDirection,
  itemsPerPage,
  initialData,
}: UseTransactionsDataParams): UseTransactionsDataResult {
  const [data, setData] = useState<Transaction[]>(initialData?.data ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [totalCount, setTotalCount] = useState(initialData?.totalCount ?? 0);
  const [totals, setTotals] = useState<TransactionTotals>({ income: 0, expense: 0, net: 0 });
  const [fixedTotals, setFixedTotals] = useState<FixedTotals>({ income: 0, expense: 0 });
  const loadingTotalsRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = FiltersSchema.parse({
          year: Number(selectedYear),
          month: Number(selectedMonth),
          page: currentPage,
          page_size: itemsPerPage,
          order_by: sortField,
          sort_direction: sortDirection,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filterType && { type: filterType }),
          ...(filterCategory && { category: filterCategory }),
        });
        const result = await getTransactions(filters);
        const validatedResult = TransactionPaginatedResponseSchema.parse(result);
        if (cancelled) return;
        if (validatedResult.response) {
          setData(validatedResult.data.data || []);
          setTotalPages(validatedResult.data.last_page || 1);
          setTotalCount(validatedResult.data.total || 0);
        } else {
          setError(validatedResult.message || translate("transactionForm.failedToFetch", getCurrentLanguage()));
          setData([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message || translate("transactions.errorLoad", getCurrentLanguage());
        setError(msg);
        toast.error(msg);
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
    return () => { cancelled = true; };
  }, [selectedYear, selectedMonth, currentPage, refreshTrigger, debouncedSearch, filterType, filterCategory, sortField, sortDirection, itemsPerPage]);

  useEffect(() => {
    let cancelled = false;
    const fetchTotals = async () => {
      loadingTotalsRef.current = true;
      try {
        const filters = FiltersSchema.parse({
          year: Number(selectedYear),
          month: Number(selectedMonth),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filterType && { type: filterType }),
          ...(filterCategory && { category: filterCategory }),
        });
        const result = await getTransactionsTotals(filters);
        if (!cancelled) {
          if (result.response && result.data) {
            setTotals({ income: result.data.income || 0, expense: result.data.expense || 0, net: result.data.net || 0 });
            setFixedTotals({ income: result.data?.fixedIncome || 0, expense: result.data?.fixedExpense || 0 });
          } else {
            setTotals({ income: 0, expense: 0, net: 0 });
          }
        }
      } catch {
        if (!cancelled) setTotals({ income: 0, expense: 0, net: 0 });
      } finally {
        if (!cancelled) loadingTotalsRef.current = false;
      }
    };
    fetchTotals();
    return () => { cancelled = true; };
  }, [selectedYear, selectedMonth, refreshTrigger, debouncedSearch, filterType, filterCategory]);

  return { data, loading, error, totalPages, totalCount, totals, fixedTotals };
}
