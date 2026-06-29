import { useState, useEffect, useMemo, useCallback } from "react";
import { ReactNode } from "react";
import { Plus, Pencil, Trash2, CreditCard, Search, X, SlidersHorizontal } from "lucide-react";
import { MyTable } from "@/components/UIComponents/MyTable";
import { MySelect } from "@/components/UIComponents/MySelect";
import { TransactionModal } from "@/components/UIComponents/TransactionModal";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionsTotals } from "@/services/transactionServices";
import { getActivePurchasesSummary } from "@/services/cardPurchaseServices";
import type { Column, Transaction, TransactionPaginatedResponse, Filters, CardPurchase } from "@/schemas/tableSchema";
import { TransactionPaginatedResponseSchema, FiltersSchema } from "@/schemas/tableSchema";
import { STORAGE_CONFIG } from "@/config/api";
import { isDemoMode } from "@/lib/demoUtils";
import { translate, getCurrentLanguage, type Language } from "@/i18n";
import { formatDate } from "@/utils/dateFormat";
import { toast } from "sonner";

interface Props {
  onRowClick?: (id: string | number) => void;
  itemsPerPage?: number;
}

export const TableData = ({ onRowClick, itemsPerPage = 10 }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [totals, setTotals] = useState({ income: 0, expense: 0, net: 0 });
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [activePurchases, setActivePurchases] = useState<CardPurchase[]>([]);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const t = (key: string) => translate(key, lang);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<'income' | 'expense' | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - i;
    return { value: year, label: String(year) };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: t(`months.${i + 1}`) }));

  const categoryOptions = [
    { value: '', label: t('transactionForm.allCategories') },
    { value: 'salary', label: t('transactionForm.categorySalary') },
    { value: 'freelance', label: t('transactionForm.categoryFreelance') },
    { value: 'investment', label: t('transactionForm.categoryInvestment') },
    { value: 'bonus', label: t('transactionForm.categoryBonus') },
    { value: 'other_income', label: t('transactionForm.categoryOtherIncome') },
    { value: 'food', label: t('transactionForm.categoryFood') },
    { value: 'transportation', label: t('transactionForm.categoryTransportation') },
    { value: 'utilities', label: t('transactionForm.categoryUtilities') },
    { value: 'entertainment', label: t('transactionForm.categoryEntertainment') },
    { value: 'healthcare', label: t('transactionForm.categoryHealthcare') },
    { value: 'shopping', label: t('transactionForm.categoryShopping') },
    { value: 'rent', label: t('transactionForm.categoryRent') },
    { value: 'other_expense', label: t('transactionForm.categoryOtherExpense') },
  ];

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasActiveFilters = debouncedSearch || filterType || filterCategory;

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterType('');
    setFilterCategory('');
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userKey = `cash_pilot_${STORAGE_CONFIG.USER_KEY}`;
        const userStr = localStorage.getItem(userKey);
        setIsLoggedIn(!!userStr);
        setDemoMode(isDemoMode());
      } catch (error) {
        setIsLoggedIn(false);
        setDemoMode(false);
      }
    }
  }, []);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  // Listen for quick-add creation to refresh table
  useEffect(() => {
    const onCreated = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('transactionCreated', onCreated);
    return () => window.removeEventListener('transactionCreated', onCreated);
  }, []);

  // Load active card purchases for the payments panel
  useEffect(() => {
    if (demoMode) return;
    const load = async () => {
      try {
        const result = await getActivePurchasesSummary();
        if (result.response && Array.isArray(result.data)) {
          setActivePurchases(result.data);
        }
      } catch { /* silently fail – panel simply won't show */ }
    };
    load();
  }, [demoMode]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = FiltersSchema.parse({
          year: selectedYear,
          month: selectedMonth,
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

        if (validatedResult.response) {
          const transactions = validatedResult.data.data || [];
          const lastPage = validatedResult.data.last_page || 1;
          const total = validatedResult.data.total || 0;

          setData(transactions);
          setTotalPages(lastPage);
          setTotalCount(total);
        } else {
          setError(validatedResult.message || t("transactionForm.failedToFetch"));
          setData([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        const errorMessage = err?.message || t("transactions.errorLoad");
        setError(errorMessage);
        toast.error(errorMessage);
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedYear, selectedMonth, currentPage, refreshTrigger, debouncedSearch, filterType, filterCategory, sortField, sortDirection, itemsPerPage]);

  // Load totals matching the same filters as the transaction list
  useEffect(() => {
    const fetchTotals = async () => {
      setLoadingTotals(true);
      try {
        const filters = FiltersSchema.parse({
          year: selectedYear,
          month: selectedMonth,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filterType && { type: filterType }),
          ...(filterCategory && { category: filterCategory }),
        });

        const result = await getTransactionsTotals(filters);

        if (result.response && result.data) {
          setTotals({
            income: result.data.income || 0,
            expense: result.data.expense || 0,
            net: result.data.net || 0,
          });
        } else {
          setTotals({ income: 0, expense: 0, net: 0 });
        }
      } catch (err: any) {
        console.error("Error fetching totals:", err?.message);
        setTotals({ income: 0, expense: 0, net: 0 });
      } finally {
        setLoadingTotals(false);
      }
    };

    fetchTotals();
  }, [selectedYear, selectedMonth, refreshTrigger, debouncedSearch, filterType, filterCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to page 1 when sort changes
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setCurrentPage(1); // Reset pagination
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    setCurrentPage(1); // Reset pagination
  };

  const handleSubmitTransaction = async (transactionData: Partial<Transaction>) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingTransaction?.uuid) {
        result = await updateTransaction(editingTransaction.uuid, transactionData);
      } else {
        result = await createTransaction(transactionData);
      }

      if (result.response) {
        toast.success(editingTransaction ? t('transactions.updated') : t('transactions.created'));
        setIsModalOpen(false);
        setEditingTransaction(null);
        setRefreshTrigger(prev => prev + 1);
        window.dispatchEvent(new CustomEvent('transactionCreated'));
      } else {
        toast.error(result.message || t('transactions.errorCreate'));
      }
    } catch (err: any) {
      toast.error(err?.message || t('common.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteTransaction(uuid);
      if (result.response) {
        toast.success(t('transactions.deleted'));
        setRefreshTrigger(prev => prev + 1);
        window.dispatchEvent(new CustomEvent('transactionCreated'));
      } else {
        toast.error(result.message || t('transactions.errorDelete'));
      }
    } catch (err: any) {
      toast.error(err?.message || t('common.unexpectedError'));
    } finally {
      setTransactionToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryColor = (category: string): { bg: string; text: string; border: string } => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      // Income categories
      salary: { bg: 'rgba(52, 168, 83, 0.12)', text: '#34A853', border: 'rgba(52, 168, 83, 0.25)' },
      freelance: { bg: 'rgba(25, 118, 210, 0.12)', text: '#1976D2', border: 'rgba(25, 118, 210, 0.25)' },
      investment: { bg: 'rgba(123, 31, 162, 0.12)', text: '#7B1FA2', border: 'rgba(123, 31, 162, 0.25)' },
      bonus: { bg: 'rgba(251, 188, 4, 0.12)', text: '#FBC004', border: 'rgba(251, 188, 4, 0.25)' },
      other_income: { bg: 'rgba(76, 175, 80, 0.12)', text: '#4CAF50', border: 'rgba(76, 175, 80, 0.25)' },
      // Expense categories
      food: { bg: 'rgba(229, 57, 53, 0.12)', text: '#E53935', border: 'rgba(229, 57, 53, 0.25)' },
      transportation: { bg: 'rgba(245, 127, 23, 0.12)', text: '#F57F17', border: 'rgba(245, 127, 23, 0.25)' },
      utilities: { bg: 'rgba(194, 24, 91, 0.12)', text: '#C2185B', border: 'rgba(194, 24, 91, 0.25)' },
      entertainment: { bg: 'rgba(142, 36, 170, 0.12)', text: '#8E24AA', border: 'rgba(142, 36, 170, 0.25)' },
      healthcare: { bg: 'rgba(211, 47, 47, 0.12)', text: '#D32F2F', border: 'rgba(211, 47, 47, 0.25)' },
      shopping: { bg: 'rgba(63, 81, 181, 0.12)', text: '#3F51B5', border: 'rgba(63, 81, 181, 0.25)' },
      rent: { bg: 'rgba(0, 121, 107, 0.12)', text: '#00796B', border: 'rgba(0, 121, 107, 0.25)' },
      other_expense: { bg: 'rgba(158, 158, 158, 0.12)', text: '#9E9E9E', border: 'rgba(158, 158, 158, 0.25)' },
    };
    return colorMap[category] || { bg: 'rgba(158, 158, 158, 0.12)', text: '#9E9E9E', border: 'rgba(158, 158, 158, 0.25)' };
  };

  const columns: Array<{
    key: keyof Transaction | 'income' | 'expense' | 'actions';
    label: string;
    sortable: boolean;
    render?: (value: any, row: Transaction) => ReactNode;
  }> = [
      { key: 'date', label: t('transactions.colDate'), sortable: true, render: (value: any): ReactNode => <span className="font-mono text-xs">{formatDate(value)}</span> },
      { key: 'description', label: t('transactions.colDescription'), sortable: true },
      {
        key: 'category', label: t('transactions.colCategory'), sortable: true,
        render: (value: any, row: Transaction): ReactNode => {
          const categoryName = String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const colors = getCategoryColor(String(value));
          return (
            <span style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            }} className="inline-block px-3.5 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all border border-solid backdrop-blur-sm hover:shadow-md hover:scale-105">
              {categoryName}
            </span>
          );
        }
      },
      { key: 'income', label: t('transactions.colIncome'), sortable: false,
        render: (_: any, row: Transaction): ReactNode => {
          const amount = row.amount;
          return row.type === 'income' ? (
            <span className="inline-block text-(--semantic-success) font-bold text-sm bg-[rgba(46,139,87,0.08)] px-3.5 py-2 rounded-lg border border-[rgba(46,139,87,0.2)] backdrop-blur-sm">
              + ${formatCurrency(amount)}
            </span>
          ) : null;
        },
      },
      { key: 'expense', label: t('transactions.colExpense'), sortable: false,
        render: (_: any, row: Transaction): ReactNode => {
          const amount = row.amount;
          return row.type === 'expense' ? (
            <span className="inline-block text-(--semantic-error) font-bold text-sm bg-[rgba(207,102,121,0.08)] px-3.5 py-2 rounded-lg border border-[rgba(207,102,121,0.2)] backdrop-blur-sm">
              - ${formatCurrency(amount)}
            </span>
          ) : null;
        },
      },
      { key: 'actions', label: t('transactions.colActions'), sortable: false,
        render: (_: any, row: Transaction): ReactNode => (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!demoMode) handleEdit(row);
                else toast.info(t('common.demoReadOnly'));
              }}
              disabled={demoMode}
              className={`p-1.5 rounded-lg transition-colors ${demoMode ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)'}`}
              title={demoMode ? t('common.demoReadOnly') : t('common.edit')}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!demoMode) setTransactionToDelete(row.uuid as string);
                else toast.info(t('common.demoReadOnly'));
              }}
              disabled={demoMode}
              className={`p-1.5 rounded-lg transition-colors ${demoMode ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)]'}`}
              title={demoMode ? t('common.demoReadOnly') : t('common.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    ];

  return (
    <div className="table-page-container">
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-100 flex items-center justify-center">
          <div className="bg-(--bg-surface) p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-sm uppercase tracking-widest text-(--text-secondary)">{t('transactions.syncing')}</p>
          </div>
        </div>
      )}

      {/* Header with Title and Filters */}
      <div className="flex flex-col gap-6 mb-6 border-b border-(--border-primary) pb-6 shrink-0">
        {/* Título y Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase">{t('transactions.title')}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-widest">{t('transactions.selectPeriod')}</span>
              <div className="flex gap-2 md:gap-3">
                <MySelect
                  options={yearOptions}
                  value={selectedYear}
                  onChange={(e: any) => handleYearChange(Number(e.target.value))}
                  className="w-32 md:w-48 h-10 md:h-12 text-sm md:text-base font-bold border-none bg-(--bg-secondary) rounded-lg md:rounded-xl"
                />
                <MySelect
                  options={monthOptions}
                  value={selectedMonth}
                  onChange={(e: any) => handleMonthChange(Number(e.target.value))}
                  className="w-32 md:w-56 h-10 md:h-12 text-sm md:text-base font-bold border-none bg-(--bg-secondary) rounded-lg md:rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
            disabled={demoMode}
            className={`group flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-xl transition-all font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto ${
              demoMode
                ? 'bg-gray-400 text-(--text-inverted) cursor-not-allowed opacity-50'
                : 'bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg'
            }`}
            title={demoMode ? t('common.demoReadOnly') : t('transactions.addTransaction')}
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90" />
            <span>{t('transactions.addTransaction')}</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('transactions.searchPlaceholder') || 'Search transactions...'}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-(--bg-secondary) border border-(--border-primary) text-(--text-primary) text-sm placeholder:text-(--text-tertiary) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-semibold ${showFilters || hasActiveFilters
                ? 'bg-(--accent-primary) text-(--text-inverted) border-(--accent-primary)'
                : 'bg-(--bg-secondary) text-(--text-primary) border-(--border-primary) hover:border-(--accent-primary)'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{t('transactions.filters') || 'Filters'}</span>
              {hasActiveFilters && (
                <span className="ml-1 w-5 h-5 rounded-full bg-(--text-inverted) text-(--accent-primary) text-xs font-bold flex items-center justify-center">
                  {[debouncedSearch, filterType, filterCategory].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 rounded-lg bg-(--bg-secondary) border border-(--border-primary)">
              <MySelect
                options={[
                  { value: '', label: t('transactions.allTypes') || 'All Types' },
                  { value: 'income', label: t('transactions.typeIncome') || 'Income' },
                  { value: 'expense', label: t('transactions.typeExpense') || 'Expense' },
                ]}
                value={filterType}
                onChange={(e: any) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-40 h-10 text-sm font-semibold border-none bg-(--bg-primary) rounded-lg"
              />
              <MySelect
                options={categoryOptions}
                value={filterCategory}
                onChange={(e: any) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-48 h-10 text-sm font-semibold border-none bg-(--bg-primary) rounded-lg"
              />
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)] rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  {t('transactions.clearFilters') || 'Clear'}
                </button>
              )}
            </div>
          )}

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-(--text-tertiary) font-semibold">
                {totalCount} {totalCount === 1 ? (t('transactions.result') || 'result') : (t('transactions.results') || 'results')}
              </span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--accent-primary) text-(--text-inverted)">
                  <Search className="w-3 h-3" />
                  "{debouncedSearch}"
                  <button onClick={() => setSearchQuery('')} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--bg-secondary) text-(--text-primary) border border-(--border-primary)">
                  {filterType}
                  <button onClick={() => setFilterType('')} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filterCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--bg-secondary) text-(--text-primary) border border-(--border-primary)">
                  {filterCategory.replace(/_/g, ' ')}
                  <button onClick={() => setFilterCategory('')} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Totales - Grid responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.totalIncome')}</span>
            <span className="text-(--semantic-success) font-black text-sm md:text-base">+ ${formatCurrency(totals.income)}</span>
          </div>
          <div className="flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.totalExpense')}</span>
            <span className="text-(--semantic-error) font-black text-sm md:text-base">- ${formatCurrency(totals.expense)}</span>
          </div>
          <div className="col-span-2 md:col-span-2 flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.netBalance')}</span>
            <div className={`px-2 md:px-4 py-0.5 md:py-1 rounded-lg border-2 font-black text-sm md:text-base transition-all ${totals.net >= 0
              ? 'text-(--semantic-success) border-(--semantic-success) bg-[rgba(46,139,87,0.1)]'
              : 'text-(--semantic-error) border-(--semantic-error) bg-[rgba(207,102,121,0.1)]'
              }`}>
              {totals.net >= 0 ? '+' : ''}${formatCurrency(totals.net)}
            </div>
          </div>
        </div>

        {/* Card Payments Panel - only shown when user has active credit purchases */}
        {activePurchases.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(var(--accent-primary-rgb),0.2)', backgroundColor: 'rgba(var(--accent-primary-rgb),0.04)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--accent-primary-rgb),0.15)' }}>
              <CreditCard size={16} style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>
                {t('transactions.cardPaymentsTitle')}
              </span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--accent-primary-rgb),0.15)', color: 'var(--accent-primary)' }}>
                {activePurchases.length} {t('transactions.cardPaymentsActive')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
              {activePurchases.map((p) => (
                <div key={p.uuid} className="flex items-center justify-between gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-primary)' }}>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-(--text-primary) truncate">{p.description}</p>
                    <p className="text-[10px] text-(--text-tertiary)">{p.card?.name} •••• {p.card?.last_four} · {p.current_installment}/{p.installments}</p>
                  </div>
                  <span className="font-black text-sm shrink-0" style={{ color: 'var(--accent-primary)' }}>
                    ${formatCurrency(p.installment_amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 text-right border-t" style={{ borderColor: 'rgba(var(--accent-primary-rgb),0.15)' }}>
              <span className="text-xs text-(--text-secondary)">Total monthly: </span>
              <span className="font-black text-sm" style={{ color: 'var(--accent-primary)' }}>
                ${formatCurrency(activePurchases.reduce((s, p) => s + p.installment_amount, 0))}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {!error && data.length > 0 && (
          <MyTable
            data={data}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onRowClick={onRowClick}
            variant="excel"
            showPagination={true}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        )}
        {!error && data.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
            <div className="w-20 h-20 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center">
              <Plus className="w-10 h-10 text-(--accent-primary)" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-(--text-primary) uppercase tracking-tight mb-2">
                {t('transactions.noTransactions')}
              </h3>
              <p className="text-(--text-secondary) text-sm md:text-base mb-6">
                {t('transactions.noTransactionsHint')}
              </p>
              <button
                onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                disabled={demoMode}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 mx-auto ${demoMode ? 'bg-gray-400 text-(--text-inverted) cursor-not-allowed opacity-50' : 'bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg'}`}
                title={demoMode ? t('common.demoReadOnly') : t('transactions.addTransaction')}
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                {t('transactions.addFirstTransaction')}
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSubmit={handleSubmitTransaction}
        isLoading={isSubmitting}
        initialData={editingTransaction}
        defaultYear={selectedYear}
        defaultMonth={selectedMonth}
      />

      <DeleteConfirmModal
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => transactionToDelete && handleDelete(transactionToDelete)}
        isLoading={isDeleting}
      />
    </div>
  );
};
