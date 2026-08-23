import { useMemo, type ReactNode } from "react";
import { Pencil, Trash2, RotateCw } from "lucide-react";
import type { CardPurchase } from "@/schemas/tableSchema";
import { formatNumber } from "@/lib/currencyFormatter";
import { formatDate } from "@/utils/dateFormat";

export type CardPurchaseColumn = {
  key: keyof CardPurchase | 'progress' | 'actions';
  label: string;
  sortable: boolean;
  render?: (value: any, row: CardPurchase) => ReactNode;
};

interface UseCardPurchasesColumnsParams {
  t: (key: string) => string;
  onAdvance: (purchase: CardPurchase) => void;
  onEdit: (purchase: CardPurchase) => void;
  onDelete: (purchase: CardPurchase) => void;
}

export function useCardPurchasesColumns({ t, onAdvance, onEdit, onDelete }: UseCardPurchasesColumnsParams) {
  return useMemo<CardPurchaseColumn[]>(() => [
    { key: 'description', label: t('purchaseForm.columnDescription'), sortable: true },
    {
      key: 'total_amount', label: t('purchaseForm.columnTotal'), sortable: false,
      render: (v: number) => <span className="font-bold text-(--text-primary)">${formatNumber(v)}</span>,
    },
    {
      key: 'installment_amount', label: t('purchaseForm.columnMonthly'), sortable: false,
      render: (v: number) => <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>${formatNumber(v)}</span>,
    },
    {
      key: 'interest_rate', label: t('purchaseForm.columnRate'), sortable: false,
      render: (v: number) => <span className="text-xs text-(--text-secondary)">{v}%</span>,
    },
    {
      key: 'progress', label: t('purchaseForm.columnInstallments'), sortable: false,
      render: (_: any, row: CardPurchase): ReactNode => {
        const pct = Math.round((row.current_installment - 1) / row.installments * 100);
        const done = row.current_installment > row.installments;
        return (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: done ? 'var(--semantic-success)' : 'var(--text-secondary)' }}>
                {done ? t('purchaseForm.paidOff') : `${row.current_installment}/${row.installments}`}
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="h-full rounded-full transition-[width]" style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: done ? 'var(--semantic-success)' : 'var(--accent-primary)',
              }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'purchase_date', label: t('purchaseForm.columnDate'), sortable: true,
      render: (v: string) => <span className="font-mono text-xs">{formatDate(v)}</span>,
    },
    {
      key: 'actions', label: t('purchaseForm.columnActions'), sortable: false,
      render: (_: any, row: CardPurchase): ReactNode => (
        <div className="flex gap-1.5">
          {row.current_installment <= row.installments && (
            <button onClick={(e) => { e.stopPropagation(); onAdvance(row); }}
              title={t('purchaseForm.advanceInstallment')}
              className="p-1.5 rounded-none transition-colors text-(--text-secondary) hover:text-(--semantic-success) hover:bg-[rgba(52,168,83,0.1)]">
              <RotateCw className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(row); }}
            className="p-1.5 rounded-none transition-colors text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)" title={t('purchaseForm.editTitle')}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(row); }}
            className="p-1.5 rounded-none transition-colors text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)]" title={t('purchaseForm.deleteTitle')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [t, onAdvance, onEdit, onDelete]);
}
