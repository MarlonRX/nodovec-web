import { useState, useEffect, useCallback, useRef } from "react";
import { MyTable } from "@/components/UIComponents/MyTable";
import { TransactionModal } from "@/components/UIComponents/TransactionModal";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";
import { createTransaction, updateTransaction, deleteTransaction } from "@/services/transactionServices";
import { getActivePurchasesSummary } from "@/services/cardPurchaseServices";
import type { Transaction, CardPurchase } from "@/schemas/tableSchema";
import { STORAGE_CONFIG } from "@/config/api";
import { isDemoMode } from "@/lib/demoUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { TransactionsHeader } from "./TransactionsHeader";
import { TransactionsFilters } from "./TransactionsFilters";
import { TransactionsTotals } from "./TransactionsTotals";
import { CardPaymentsPanel } from "./CardPaymentsPanel";
import { TransactionsEmptyState } from "./TransactionsEmptyState";
import { useTransactionsData, type TransactionsInitialData } from "./useTransactionsData";
import { useTransactionColumns } from "./useTransactionsColumns";
import { buildCategoryOptions } from "./transactionsConstants";

interface TransactionsPageProps {
  onRowClick?: (id: string | number) => void;
  itemsPerPage?: number;
  initialData?: TransactionsInitialData | null;
}

export const TransactionsPage = ({ onRowClick, itemsPerPage = 10, initialData = null }: TransactionsPageProps) => {
  const { t, lang } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isLoggedInRef = useRef(false);
  const [demoMode, setDemoMode] = useState(false);

  const [activePurchases, setActivePurchases] = useState<CardPurchase[]>([]);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1));

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<'income' | 'expense' | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - i;
    return { value: String(year), label: String(year) };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: t(`months.${i + 1}`) }));
  const categoryOptions = buildCategoryOptions(lang);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchQuery); setCurrentPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasActiveFilters = debouncedSearch || filterType || filterCategory;

  const clearFilters = useCallback(() => {
    setSearchQuery(''); setDebouncedSearch(''); setFilterType(''); setFilterCategory(''); setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userKey = `cash_pilot_${STORAGE_CONFIG.USER_KEY}`;
        const userStr = localStorage.getItem(userKey);
        isLoggedInRef.current = !!userStr;
        setDemoMode(isDemoMode());
      } catch { isLoggedInRef.current = false; setDemoMode(false); }
    }
  }, []);

  useEffect(() => {
    const onCreated = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('transactionCreated', onCreated);
    return () => window.removeEventListener('transactionCreated', onCreated);
  }, []);

  useEffect(() => {
    if (demoMode) return;
    let cancelled = false;
    getActivePurchasesSummary().then((result) => {
      if (!cancelled && result.response && Array.isArray(result.data)) setActivePurchases(result.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [demoMode]);

  const { data, loading, error, totalPages, totalCount, totals, fixedTotals } = useTransactionsData({
    selectedYear, selectedMonth, currentPage, refreshTrigger, debouncedSearch,
    filterType, filterCategory, sortField, sortDirection, itemsPerPage,
    initialData,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setCurrentPage(1);
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

        setTimeout(() => {
          setEditingTransaction(null);
          setRefreshTrigger(prev => prev + 1);
          window.dispatchEvent(new CustomEvent('transactionCreated'));
        }, 300);

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

  const columns = useTransactionColumns({ t, demoMode, handleEdit, setTransactionToDelete });

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

      <div className="flex flex-col gap-6 mb-6 border-b border-(--border-primary) pb-6 shrink-0">
        <TransactionsHeader
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          yearOptions={yearOptions}
          monthOptions={monthOptions}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
          onAdd={() => { setEditingTransaction(null); setIsModalOpen(true); }}
          t={t}
        />
        <TransactionsFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          hasActiveFilters={!!hasActiveFilters}
          filterType={filterType}
          onFilterTypeChange={(v) => { setFilterType(v); setCurrentPage(1); }}
          filterCategory={filterCategory}
          onFilterCategoryChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}
          categoryOptions={categoryOptions}
          onClearFilters={clearFilters}
          totalCount={totalCount}
          debouncedSearch={debouncedSearch}
          t={t}
        />
        <TransactionsTotals totals={totals} fixedTotals={fixedTotals} t={t} />
        {activePurchases.length > 0 && <CardPaymentsPanel purchases={activePurchases} t={t} />}
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
          <TransactionsEmptyState onAdd={() => { setEditingTransaction(null); setIsModalOpen(true); }} t={t} />
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSubmit={handleSubmitTransaction}
        isLoading={isSubmitting}
        initialData={editingTransaction}
        defaultYear={Number(selectedYear)}
        defaultMonth={Number(selectedMonth)}
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
