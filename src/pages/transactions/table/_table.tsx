import { useState, useEffect, useMemo } from "react";
import { ReactNode } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { MyTable } from "@/components/UIComponents/MyTable";
import { MySelect } from "@/components/UIComponents/MySelect";
import { TransactionModal } from "@/components/UIComponents/TransactionModal";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionsTotals } from "@/services/transactionServices";
import type { Column, Transaction, TransactionPaginatedResponse, Filters } from "@/schemas/tableSchema";
import { TransactionPaginatedResponseSchema, FiltersSchema } from "@/schemas/tableSchema";
import { STORAGE_CONFIG } from "@/config/api";
import { isDemoMode } from "@/lib/demoUtils";
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

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentDate.getFullYear() - i;
    return { value: year, label: String(year) };
  });

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

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
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = FiltersSchema.parse({
          year: selectedYear,
          month: selectedMonth,
        });

        const result = await getTransactions(filters);
        const validatedResult = TransactionPaginatedResponseSchema.parse(result);

        if (validatedResult.response) {
          // Extraer datos del objeto paginado de Laravel
          const transactions = validatedResult.data.data || [];
          const lastPage = validatedResult.data.last_page || 1;
          
          setData(transactions);
          setTotalPages(lastPage);
        } else {
          setError(validatedResult.message || "Failed to fetch transactions");
          setData([]);
        }
      } catch (err: any) {
        const errorMessage = err?.message || "Error al cargar transacciones";
        console.error("Error fetching transactions:", errorMessage);
        toast.error(errorMessage);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedYear, selectedMonth, refreshTrigger]);

  // Load totals for ALL transactions in the selected month/year
  useEffect(() => {
    const fetchTotals = async () => {
      setLoadingTotals(true);
      try {
        const filters = FiltersSchema.parse({
          year: selectedYear,
          month: selectedMonth,
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
  }, [selectedYear, selectedMonth, refreshTrigger]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        toast.success(editingTransaction ? "Transaction updated" : "Transaction created");
        setIsModalOpen(false);
        setEditingTransaction(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.message || "Error al procesar la transacción");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteTransaction(uuid);
      if (result.response) {
        toast.success("Transaction deleted definitively");
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.message || "Error al eliminar");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error inesperado");
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
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        render: (value: any): ReactNode => new Date(value).toLocaleDateString(),
      },
      {
        key: 'description',
        label: 'Description',
        sortable: true,
      },
      {
        key: 'category',
        label: 'Category',
        sortable: true,
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
      {
        key: 'income',
        label: 'Income',
        sortable: false,
        render: (_: any, row: Transaction): ReactNode => {
          const amount = row.amount;
          return row.type === 'income' ? (
            <span className="inline-block text-(--semantic-success) font-bold text-sm bg-[rgba(46,139,87,0.08)] px-3.5 py-2 rounded-lg border border-[rgba(46,139,87,0.2)] backdrop-blur-sm">
              + ${formatCurrency(amount)}
            </span>
          ) : null;
        },
      },
      {
        key: 'expense',
        label: 'Expense',
        sortable: false,
        render: (_: any, row: Transaction): ReactNode => {
          const amount = row.amount;
          return row.type === 'expense' ? (
            <span className="inline-block text-(--semantic-error) font-bold text-sm bg-[rgba(207,102,121,0.08)] px-3.5 py-2 rounded-lg border border-[rgba(207,102,121,0.2)] backdrop-blur-sm">
              - ${formatCurrency(amount)}
            </span>
          ) : null;
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        render: (_: any, row: Transaction): ReactNode => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!demoMode) handleEdit(row);
                else toast.info("Demo mode: Read-only");
              }}
              disabled={demoMode}
              className={`p-1.5 rounded-lg transition-colors ${
                demoMode
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : 'text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)'
              }`}
              title={demoMode ? "Demo mode: Read-only" : "Edit"}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!demoMode) setTransactionToDelete(row.uuid as string);
                else toast.info("Demo mode: Read-only");
              }}
              disabled={demoMode}
              className={`p-1.5 rounded-lg transition-colors ${
                demoMode
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : 'text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)]'
              }`}
              title={demoMode ? "Demo mode: Read-only" : "Delete"}
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
            <p className="font-bold text-sm uppercase tracking-widest text-(--text-secondary)">Sincronizando...</p>
          </div>
        </div>
      )}

      {/* Header with Title and Filters */}
      <div className="flex flex-col gap-6 mb-6 border-b border-(--border-primary) pb-6 shrink-0">
        {/* Título y Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase">Transactions</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-widest">Select Period:</span>
              <div className="flex gap-2 md:gap-3">
                <MySelect
                  options={yearOptions}
                  value={selectedYear}
                  onChange={(e: any) => setSelectedYear(Number(e.target.value))}
                  className="w-32 md:w-48 h-10 md:h-12 text-sm md:text-base font-bold border-none bg-(--bg-secondary) rounded-lg md:rounded-xl"
                />
                <MySelect
                  options={monthOptions}
                  value={selectedMonth}
                  onChange={(e: any) => setSelectedMonth(Number(e.target.value))}
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
            title={demoMode ? "Demo mode: Read-only" : "Add new transaction"}
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Totales - Grid responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">Total Income</span>
            <span className="text-(--semantic-success) font-black text-sm md:text-base">+ ${formatCurrency(totals.income)}</span>
          </div>
          <div className="flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">Total Expense</span>
            <span className="text-(--semantic-error) font-black text-sm md:text-base">- ${formatCurrency(totals.expense)}</span>
          </div>
          <div className="col-span-2 md:col-span-2 flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">Net Balance</span>
            <div className={`px-2 md:px-4 py-0.5 md:py-1 rounded-lg border-2 font-black text-sm md:text-base transition-all ${totals.net >= 0
              ? 'text-(--semantic-success) border-(--semantic-success) bg-[rgba(46,139,87,0.1)]'
              : 'text-(--semantic-error) border-(--semantic-error) bg-[rgba(207,102,121,0.1)]'
              }`}>
              {totals.net >= 0 ? '+' : ''}${formatCurrency(totals.net)}
            </div>
          </div>
        </div>
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
            showPagination={false}
          />
        )}
        {!error && data.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
            <div className="w-20 h-20 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center">
              <Plus className="w-10 h-10 text-(--accent-primary)" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-(--text-primary) uppercase tracking-tight mb-2">
                No transactions yet
              </h3>
              <p className="text-(--text-secondary) text-sm md:text-base mb-6">
                Start tracking your money by adding your first transaction!
              </p>
              <button
                onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                disabled={demoMode}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 mx-auto ${
                  demoMode
                    ? 'bg-gray-400 text-(--text-inverted) cursor-not-allowed opacity-50'
                    : 'bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg'
                }`}
                title={demoMode ? "Demo mode: Read-only" : "Add new transaction"}
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                Add Your First Transaction
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