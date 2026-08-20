import { Plus } from "lucide-react";

interface TransactionsEmptyStateProps {
  onAdd: () => void;
  t: (key: string) => string;
}

export function TransactionsEmptyState({ onAdd, t }: TransactionsEmptyStateProps) {
  return (
    <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
      <div className="w-20 h-20 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center">
        <Plus className="w-10 h-10 text-(--accent-primary)" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-(--text-primary) uppercase tracking-tight mb-2">{t('transactions.noTransactions')}</h3>
        <p className="text-(--text-secondary) text-sm md:text-base mb-6">{t('transactions.noTransactionsHint')}</p>
        <button onClick={onAdd} className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-colors transition-transform font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 mx-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg" title={t('transactions.addTransaction')}>
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          {t('transactions.addFirstTransaction')}
        </button>
      </div>
    </div>
  );
}
