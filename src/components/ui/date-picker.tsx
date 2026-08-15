import * as React from "react";
import DatePicker from "react-datepicker";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePickerInput({ value, onChange, placeholder = "Seleccionar fecha", className }: DatePickerProps) {
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const d = new Date(value + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const handleChange = (date: Date | null) => {
    if (date) {
      const iso = date.toISOString().slice(0, 10);
      onChange?.(iso);
    }
  };

  return (
    <div className="relative w-full">
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        className={cn(
          "w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-(--accent-primary)",
          "border border-(--border-primary) bg-(--bg-secondary) text-(--text-primary)",
          "cursor-pointer",
          className
        )}
        calendarClassName="custom-datepicker-calendar"
        dayClassName={() => "custom-datepicker-day"}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="p-1 rounded hover:bg-(--bg-hover) transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-bold text-(--text-primary) uppercase tracking-wider">
              {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="p-1 rounded hover:bg-(--bg-hover) transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      />
      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  );
}
