import { formatAmount } from "./transactionsConstants";
import type { TransactionTotals, FixedTotals } from "./useTransactionsData";

interface TransactionsTotalsProps {
  totals: TransactionTotals;
  fixedTotals: FixedTotals;
  t: (key: string) => string;
}

export const TransactionsTotals = ({ totals, fixedTotals, t }: TransactionsTotalsProps) => (
  <div className={`grid grid-cols-2 ${fixedTotals.income || fixedTotals.expense ? "md:grid-cols-4" : "md:grid-cols-3"} gap-2 md:gap-4`}>
    {fixedTotals.income || fixedTotals.expense ? (
      <div>
        {fixedTotals.income ? (
          <div className="flex flex-col items-center md:items-start ml-5">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.totalFixedIncome')}</span>
            <span className="text-(--semantic-success) font-black text-sm md:text-base">+ ${formatAmount(fixedTotals.income)}</span>
          </div>
        ) : null}
        {fixedTotals.expense ? (
          <div className="flex flex-col items-center md:items-start mt-2 ml-5">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.totalFixedExpense')}</span>
            <span className="text-(--semantic-error) font-black text-sm md:text-base">- ${formatAmount(fixedTotals.expense)}</span>
          </div>
        ) : null}
      </div>
    ) : null}
    <div className="flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
      <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.totalIncome')}</span>
      <span className="text-(--semantic-success) font-black text-sm md:text-base">+ ${formatAmount(totals.income)}</span>
    </div>
    <div className="flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
      <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.totalExpense')}</span>
      <span className="text-(--semantic-error) font-black text-sm md:text-base">- ${formatAmount(totals.expense)}</span>
    </div>
    <div className="flex flex-col items-center md:items-start p-2 md:p-3 rounded-lg bg-(--bg-secondary)">
      <span className="text-(--text-tertiary) text-[8px] md:text-[9px] uppercase font-bold tracking-widest mb-1">{t('transactions.netBalance')}</span>
      <div className={`px-2 md:px-4 py-0.5 md:py-1 rounded-lg border-2 font-black text-sm md:text-base transition-colors ${totals.net >= 0 ? 'text-(--semantic-success) border-(--semantic-success) bg-[rgba(46,139,87,0.1)]' : 'text-(--semantic-error) border-(--semantic-error) bg-[rgba(207,102,121,0.1)]'}`}>
        {totals.net >= 0 ? '+' : ''}${formatAmount(totals.net)}
      </div>
    </div>
  </div>
);
