import { Plus } from "lucide-react";
import SplitText from "@/components/reactbits/SplitText";
import ShinyText from "@/components/reactbits/ShinyText";
import SparkButton from "@/components/reactbits/SparkButton";
import CountUp from "@/components/reactbits/CountUp";
import BentoGrid, { BentoCard } from "@/components/reactbits/MagicBento";
import { formatNumber } from "@/lib/currencyFormatter";
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
          <h2 id="financing-title" className="text-2xl md:text-4xl font-semibold text-(--text-primary) tracking-tight">
            <SplitText text={t("financing.title")} />
          </h2>
          <ShinyText text={t("financing.subtitle")} speed={4} className="text-sm font-bold tracking-wider inline-block" />
        </div>
        <SparkButton onClick={onNewPlan} icon={<Plus className="w-5 h-5 md:w-6 md:h-6" />}>
          {t("financing.newPlan")}
        </SparkButton>
      </div>

      <BentoGrid className="grid grid-cols-3 gap-2 md:gap-4">
        <BentoCard className="glass-panel animate-fade-up rounded-none flex flex-col items-center md:items-start p-3 md:p-4" enableStars={false}>
          <span className="text-(--text-tertiary) text-xs font-bold tracking-wider mb-1 flex items-center">{t("financing.totalFinanced")}<FinancingTip text={t("financing.tipFinanced")} /></span>
          <span className="font-semibold font-financial text-base md:text-lg text-(--text-primary)">
            $<CountUp to={totalSum} format={(n) => formatNumber(n)} duration={1.5} />
          </span>
        </BentoCard>
        <BentoCard className="glass-panel animate-fade-up rounded-none flex flex-col items-center md:items-start p-3 md:p-4" style={{ animationDelay: "80ms" }} enableStars={false}>
          <span className="text-(--text-tertiary) text-xs font-bold tracking-wider mb-1 flex items-center">{t("financing.activePlans")}<FinancingTip text={t("financing.tipActive")} /></span>
          <span className="font-semibold font-financial text-base md:text-lg" style={{ color: 'var(--accent-primary)' }}>
            <CountUp to={activeCount} format={(n) => String(Math.round(n))} duration={1.2} />
          </span>
        </BentoCard>
        <BentoCard className="glass-panel animate-fade-up rounded-none flex flex-col items-center md:items-start p-3 md:p-4" style={{ animationDelay: "160ms" }} enableStars={false}>
          <span className="text-(--text-tertiary) text-xs font-bold tracking-wider mb-1 flex items-center">{t("financing.monthlyPayment")}<FinancingTip text={t("financing.tipMonthlyDue")} /></span>
          <span className="font-semibold font-financial text-base md:text-lg" style={{ color: totalMonthly > 0 ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
            $<CountUp to={totalMonthly} format={(n) => formatNumber(n)} duration={1.5} />
          </span>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
