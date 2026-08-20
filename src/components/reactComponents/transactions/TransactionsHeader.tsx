import { Plus } from "lucide-react";
import { MySelect } from "@/components/UIComponents/MySelect";

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
      <h2 className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase">{t('transactions.title')}</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-widest">{t('transactions.selectPeriod')}</span>
        <div className="flex gap-2 md:gap-3">
          <MySelect options={yearOptions} value={selectedYear} onChange={(e: any) => onYearChange(e.target.value)} className="w-32 md:w-48 h-10 md:h-12 text-sm md:text-base font-bold border-none bg-(--bg-secondary) rounded-lg md:rounded-xl" />
          <MySelect options={monthOptions} value={selectedMonth} onChange={(e: any) => onMonthChange(e.target.value)} className="w-32 md:w-56 h-10 md:h-12 text-sm md:text-base font-bold border-none bg-(--bg-secondary) rounded-lg md:rounded-xl" />
        </div>
      </div>
    </div>
    <button onClick={onAdd} className="group flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-xl transition-colors transition-transform font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg" title={t('transactions.addTransaction')}>
      <Plus className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90" />
      <span>{t('transactions.addTransaction')}</span>
    </button>
  </div>
);
