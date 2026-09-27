import BentoGrid, { BentoCard } from "@/components/reactbits/MagicBento";
import CountUp from "@/components/reactbits/CountUp";
import { formatAmount } from "./transactionsConstants";
import type { TransactionTotals, FixedTotals } from "./useTransactionsData";

interface TransactionsTotalsProps {
  totals: TransactionTotals;
  fixedTotals: FixedTotals;
  t: (key: string) => string;
}

export const TransactionsTotals = ({ totals, fixedTotals, t }: TransactionsTotalsProps) => (
  <BentoGrid className={`grid grid-cols-2 ${fixedTotals.income || fixedTotals.expense ? "md:grid-cols-4" : "md:grid-cols-3"} gap-2 md:gap-4`}>
    {fixedTotals.income || fixedTotals.expense ? (
      <div>
        {fixedTotals.income ? (
          <div className="flex flex-col items-center md:items-start ml-5">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] font-bold mb-1">{t('transactions.totalFixedIncome')}</span>
            <span className="text-(--semantic-success) font-semibold font-financial text-sm md:text-base">
              + $<CountUp to={fixedTotals.income} format={formatAmount} duration={1.5} />
            </span>
          </div>
        ) : null}
        {fixedTotals.expense ? (
          <div className="flex flex-col items-center md:items-start mt-2 ml-5">
            <span className="text-(--text-tertiary) text-[8px] md:text-[9px] font-bold mb-1">{t('transactions.totalFixedExpense')}</span>
            <span className="text-(--semantic-error) font-semibold font-financial text-sm md:text-base">
              - $<CountUp to={fixedTotals.expense} format={formatAmount} duration={1.5} />
            </span>
          </div>
        ) : null}
      </div>
    ) : null}
    <BentoCard
      className="glass-panel animate-fade-up rounded-none flex flex-col items-center md:items-start p-2 md:p-3"
      enableStars={false}
    >
      <span className="text-(--text-tertiary) text-[8px] md:text-[9px] font-bold mb-1">{t('transactions.totalIncome')}</span>
      <span className="text-(--semantic-success) font-semibold font-financial text-sm md:text-base">
        + $<CountUp to={totals.income} format={formatAmount} duration={1.5} />
      </span>
    </BentoCard>
    <BentoCard
      className="glass-panel animate-fade-up rounded-none flex flex-col items-center md:items-start p-2 md:p-3"
      style={{ animationDelay: "80ms" }}
      enableStars={false}
    >
      <span className="text-(--text-tertiary) text-[8px] md:text-[9px] font-bold mb-1">{t('transactions.totalExpense')}</span>
      <span className="text-(--semantic-error) font-semibold font-financial text-sm md:text-base">
        - $<CountUp to={totals.expense} format={formatAmount} duration={1.5} />
      </span>
    </BentoCard>
    <BentoCard
      className="glass-panel animate-fade-up rounded-none flex flex-col items-center md:items-start p-2 md:p-3"
      style={{ animationDelay: "160ms" }}
      enableStars={false}
    >
      <span className="text-(--text-tertiary) text-[8px] md:text-[9px] font-bold mb-1">{t('transactions.netBalance')}</span>
      <div className={`px-2 md:px-4 py-0.5 md:py-1 rounded-none border-2 font-semibold font-financial text-sm md:text-base transition-colors ${totals.net >= 0 ? 'text-(--semantic-success) border-(--semantic-success) bg-[rgba(46,139,87,0.1)]' : 'text-(--semantic-error) border-(--semantic-error) bg-[rgba(207,102,121,0.1)]'}`}>
        {totals.net >= 0 ? '+' : '-'}$<CountUp to={Math.abs(totals.net)} format={formatAmount} duration={1.5} />
      </div>
    </BentoCard>
  </BentoGrid>
);
