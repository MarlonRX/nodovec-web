import { useMemo, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/schemas/tableSchema";
import { formatDate } from "@/utils/dateFormat";
import { formatAmount, getCategoryColor, getCategoryLabel } from "./transactionsConstants";

export type TransactionColumn = {
  key: keyof Transaction | 'income' | 'expense' | 'actions';
  label: string;
  sortable: boolean;
  render?: (value: any, row: Transaction) => ReactNode;
};

interface UseTransactionColumnsParams {
  t: (key: string) => string;
  demoMode: boolean;
  handleEdit: (transaction: Transaction) => void;
  setTransactionToDelete: (uuid: string | null) => void;
}

export function useTransactionColumns({
  t,
  demoMode,
  handleEdit,
  setTransactionToDelete,
}: UseTransactionColumnsParams) {
  return useMemo<TransactionColumn[]>(() => [
    { key: 'date', label: t('transactions.colDate'), sortable: true, render: (value: any): ReactNode => <span className="font-mono text-xs">{formatDate(value)}</span> },
    { key: 'description', label: t('transactions.colDescription'), sortable: true },
    {
      key: 'category', label: t('transactions.colCategory'), sortable: true,
      render: (value: any): ReactNode => {
        const category = String(value);
        const colors = getCategoryColor(category);
        return (
          <span style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
            className="inline-block px-3.5 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-shadow transition-transform border border-solid backdrop-blur-sm hover:shadow-md hover:scale-105">
            {getCategoryLabel(category, t)}
          </span>
        );
      }
    },
    {
      key: 'income', label: t('transactions.colIncome'), sortable: false,
      render: (_: any, row: Transaction): ReactNode => row.type === 'income' ? (
        <span className="inline-block text-(--semantic-success) font-bold text-sm bg-[rgba(46,139,87,0.08)] px-3.5 py-2 rounded-lg border border-[rgba(46,139,87,0.2)] backdrop-blur-sm">
          + ${formatAmount(row.amount)}
        </span>
      ) : null,
    },
    {
      key: 'expense', label: t('transactions.colExpense'), sortable: false,
      render: (_: any, row: Transaction): ReactNode => row.type === 'expense' ? (
        <span className="inline-block text-(--semantic-error) font-bold text-sm bg-[rgba(207,102,121,0.08)] px-3.5 py-2 rounded-lg border border-[rgba(207,102,121,0.2)] backdrop-blur-sm">
          - ${formatAmount(row.amount)}
        </span>
      ) : null,
    },
    {
      key: 'actions', label: t('transactions.colActions'), sortable: false,
      render: (_: any, row: Transaction): ReactNode => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); if (!demoMode) handleEdit(row); else toast.info(t('common.demoReadOnly')); }} disabled={demoMode}
            className={`p-1.5 rounded-lg transition-colors ${demoMode ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)'}`}
            title={demoMode ? t('common.demoReadOnly') : t('common.edit')}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (!demoMode) setTransactionToDelete(row.uuid as string); else toast.info(t('common.demoReadOnly')); }} disabled={demoMode}
            className={`p-1.5 rounded-lg transition-colors ${demoMode ? 'text-gray-400 cursor-not-allowed opacity-50' : 'text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)]'}`}
            title={demoMode ? t('common.demoReadOnly') : t('common.delete')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [t, demoMode, handleEdit, setTransactionToDelete]);
}
