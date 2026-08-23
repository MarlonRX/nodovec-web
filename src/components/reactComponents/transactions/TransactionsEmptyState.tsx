import { Plus } from "lucide-react";

interface TransactionsEmptyStateProps {
  onAdd: () => void;
  t: (key: string) => string;
}

export function TransactionsEmptyState({ onAdd, t }: TransactionsEmptyStateProps) {
  return (
    <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
      <div className="w-20 h-20 bg-[rgba(var(--accent-primary-rgb), 0.1)] rounded-full flex items-center justify-center">
        <Plus className="w-10 h-10 text-(--accent-primary)" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-semibold text-(--text-primary) tracking-tight mb-2">{t('transactions.noTransactions')}</h3>
        <p className="text-(--text-secondary) text-sm md:text-base mb-6">{t('transactions.noTransactionsHint')}</p>
        <button onClick={onAdd} className="group flex items-center gap-2 px-6 py-3 rounded-none transition-colors font-semibold text-sm mx-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)" title={t('transactions.addTransaction')}>
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          {t('transactions.addFirstTransaction')}
        </button>
      </div>
    </div>
  );
}
