import { Plus } from "lucide-react";
import { formatMoney } from "@/utils/cardFinance";
import { FinancingTip } from "./FinancingTip";

interface FinancingHeaderProps {
  totalSum: number;
  activeCount: number;
  totalMonthly: number;
  onNewPlan: () => void;
  t: (key: string) => string;
}

export function FinancingHeader({ totalSum, activeCount, totalMonthly, onNewPlan, t }: FinancingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-2 border-b border-(--border-primary) pb-6 shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="financing-title" className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase">{t("financing.title")}</h2>
          <p className="text-(--text-tertiary) text-sm uppercase font-bold tracking-wider">{t("financing.subtitle")}</p>
        </div>
        <button onClick={onNewPlan}
          className="group flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-xl transition-colors transition-transform font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg">
          <Plus className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90" />
          <span>{t("financing.newPlan")}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="flex flex-col items-center md:items-start p-3 md:p-4 rounded-lg bg-(--bg-secondary)">
          <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-wider mb-1 flex items-center">{t("financing.totalFinanced")}<FinancingTip text={t("financing.tipFinanced")} /></span>
          <span className="font-black text-base md:text-lg text-(--text-primary)">${formatMoney(totalSum)}</span>
        </div>
        <div className="flex flex-col items-center md:items-start p-3 md:p-4 rounded-lg bg-(--bg-secondary)">
          <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-wider mb-1 flex items-center">{t("financing.activePlans")}<FinancingTip text={t("financing.tipActive")} /></span>
          <span className="font-black text-base md:text-lg" style={{ color: 'var(--accent-primary)' }}>{activeCount}</span>
        </div>
        <div className="flex flex-col items-center md:items-start p-3 md:p-4 rounded-lg bg-(--bg-secondary)">
          <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-wider mb-1 flex items-center">{t("financing.monthlyPayment")}<FinancingTip text={t("financing.tipMonthlyDue")} /></span>
          <span className="font-black text-base md:text-lg" style={{ color: totalMonthly > 0 ? 'var(--accent-primary)' : 'var(--text-primary)' }}>${formatMoney(totalMonthly)}</span>
        </div>
      </div>
    </div>
  );
}
