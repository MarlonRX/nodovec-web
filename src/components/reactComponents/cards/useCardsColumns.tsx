import { useMemo, type ReactNode } from "react";
import { Pencil, Trash2, CreditCard, List } from "lucide-react";
import type { Card } from "@/schemas/tableSchema";
import { formatNumber } from "@/lib/currencyFormatter";
import { formatMonthYear } from "@/utils/dateFormat";

export type CardColumn = {
  key: keyof Card | 'actions';
  label: string;
  sortable: boolean;
  render?: (value: any, row: Card) => ReactNode;
};

interface UseCardsColumnsParams {
  t: (key: string) => string;
  onViewPurchases: (card: Card) => void;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

export function useCardsColumns({ t, onViewPurchases, onEdit, onDelete }: UseCardsColumnsParams) {
  return useMemo<CardColumn[]>(() => [
    {
      key: 'type', label: t('cards.colType'), sortable: false,
      render: (value: string): ReactNode => (
        <span style={{
          backgroundColor: value === 'credit' ? 'rgba(123,31,162,0.12)' : 'rgba(25,118,210,0.12)',
          color: value === 'credit' ? '#7B1FA2' : '#1976D2',
          border: `1px solid ${value === 'credit' ? 'rgba(123,31,162,0.25)' : 'rgba(25,118,210,0.25)'}`,
        }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none font-bold text-xs tracking-wider">
          <CreditCard size={12} />{value === 'credit' ? t('cards.typeCredit') : t('cards.typeDebit')}
        </span>
      ),
    },
    { key: 'name', label: t('cards.colName'), sortable: true },
    { key: 'bank', label: t('cards.colBank'), sortable: true },
    {
      key: 'last_four', label: t('cards.colNumber'), sortable: false,
      render: (value: string): ReactNode => <span className="font-mono text-sm text-(--text-secondary)">•••• •••• •••• {value}</span>,
    },
    {
      key: 'current_balance', label: t('cards.colDebt'), sortable: false,
      render: (value: number): ReactNode => (
        <span className="font-bold" style={{ color: value > 0 ? 'var(--semantic-error)' : 'var(--text-secondary)' }}>${formatNumber(value ?? 0)}</span>
      ),
    },
    {
      key: 'credit_limit', label: t('cards.colLimit'), sortable: false,
      render: (value: number | null): ReactNode =>
        value != null ? <span className="text-(--text-secondary)">${formatNumber(value)}</span> : <span className="text-(--text-tertiary) text-xs">—</span>,
    },
    {
      key: 'expiry_date', label: t('cards.colExpiry'), sortable: false,
      render: (value: string): ReactNode => <span className="font-mono text-xs">{formatMonthYear(value)}</span>,
    },
    {
      key: 'is_active', label: t('cards.colStatus'), sortable: false,
      render: (value: boolean): ReactNode => (
        <span style={{
          backgroundColor: value ? 'rgba(52,168,83,0.12)' : 'rgba(207,102,121,0.12)',
          color: value ? '#34A853' : '#CF6679',
          border: `1px solid ${value ? 'rgba(52,168,83,0.25)' : 'rgba(207,102,121,0.25)'}`,
        }} className="inline-block px-3 py-1 rounded-none font-semibold text-xs tracking-wider">
          {value ? t('cards.statusActive') : t('cards.statusInactive')}
        </span>
      ),
    },
    {
      key: 'actions', label: t('cards.colActions'), sortable: false,
      render: (_: any, row: Card): ReactNode => (
        <div className="flex gap-1.5">
          {row.type === 'credit' && (
            <button onClick={(e) => { e.stopPropagation(); onViewPurchases(row); }} title={t('cards.titlePurchases')}
              className="p-1.5 rounded-none transition-colors text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)">
              <List className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(row); }}
            className="p-1.5 rounded-none transition-colors text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)" title={t('common.edit')}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(row); }}
            className="p-1.5 rounded-none transition-colors text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)]" title={t('common.delete')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [t, onViewPurchases, onEdit, onDelete]);
}
