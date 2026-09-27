import { Plus } from "lucide-react";
import SparkButton from "@/components/reactbits/SparkButton";

interface TransactionsEmptyStateProps {
  onAdd: () => void;
  t: (key: string) => string;
}

export function TransactionsEmptyState({ onAdd, t }: TransactionsEmptyStateProps) {
  return (
    <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
      <div className="w-20 h-20 bg-[rgba(var(--accent-primary-rgb), 0.1)] rounded-full flex items-center justify-center animate-pulse">
        <Plus className="w-10 h-10 text-(--accent-primary)" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-semibold text-(--text-primary) tracking-tight mb-2">{t('transactions.noTransactions')}</h3>
        <p className="text-(--text-secondary) text-sm md:text-base mb-6">{t('transactions.noTransactionsHint')}</p>
        <SparkButton
          onClick={onAdd}
          icon={<Plus className="w-5 h-5" />}
          wrapperClassName="w-auto mx-auto"
          className="px-6 py-3 text-sm"
          title={t('transactions.addTransaction')}
        >
          {t('transactions.addFirstTransaction')}
        </SparkButton>
      </div>
    </div>
  );
}
