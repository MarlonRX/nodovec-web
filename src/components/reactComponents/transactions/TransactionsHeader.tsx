import { Plus } from "lucide-react";
import { MySelect } from "@/components/UIComponents/MySelect";
import SplitText from "@/components/reactbits/SplitText";
import SparkButton from "@/components/reactbits/SparkButton";

interface TransactionsHeaderProps {
  selectedYear: string;
  selectedMonth: string;
  yearOptions: { value: string; label: string }[];
  monthOptions: { value: string; label: string }[];
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onAdd: () => void;
  t: (key: string) => string;
}

export const TransactionsHeader = ({
  selectedYear,
  selectedMonth,
  yearOptions,
  monthOptions,
  onYearChange,
  onMonthChange,
  onAdd,
  t,
}: TransactionsHeaderProps) => (
  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl md:text-4xl font-semibold text-(--text-primary) tracking-tight">
        <SplitText text={t('transactions.title')} />
      </h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <span className="text-(--text-tertiary) text-xs font-bold tracking-wide">{t('transactions.selectPeriod')}</span>
        <div className="flex gap-2 md:gap-3">
          <MySelect options={yearOptions} value={selectedYear} onChange={(e: any) => onYearChange(e.target.value)} className="w-32 md:w-48 h-10 md:h-12 text-sm md:text-base font-bold border-none bg-(--bg-secondary) rounded-none md:rounded-none" />
          <MySelect options={monthOptions} value={selectedMonth} onChange={(e: any) => onMonthChange(e.target.value)} className="w-32 md:w-56 h-10 md:h-12 text-sm md:text-base font-bold border-none bg-(--bg-secondary) rounded-none md:rounded-none" />
        </div>
      </div>
    </div>
    <SparkButton onClick={onAdd} icon={<Plus className="w-5 h-5 md:w-6 md:h-6" />} title={t('transactions.addTransaction')}>
      {t('transactions.addTransaction')}
    </SparkButton>
  </div>
);
