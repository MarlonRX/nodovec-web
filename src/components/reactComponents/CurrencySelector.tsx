import { useEffect, useState } from "react";
import { DollarSign, ChevronDown, Check } from "lucide-react";

type Currency = "USD" | "EUR" | "COP";

const currencyLabels: Record<Currency, string> = {
  USD: "USD — US Dollar",
  COP: "COP — Peso Colombiano",
  EUR: "EUR — Euro",
};

export function CurrencySelector({
  value,
  onChange,
  fullWidth,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
  fullWidth?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".currency-selector")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative currency-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${fullWidth ? "justify-between w-full" : ""} space-x-2 px-3 py-2 text-sm font-medium rounded-none focus:outline-none transition-colors duration-200 hover:bg-amber-600/10`}
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--accent-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <DollarSign size={16} />
        <span>{currencyLabels[value]}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 rounded-none shadow-lg focus:outline-none z-50 ${fullWidth ? "left-0 right-0 w-full" : "right-0 w-48"}`}
          style={{
            backgroundColor: "var(--bg-surface)",
            border: `1px solid var(--border-primary)`,
          }}
          role="listbox"
        >
          <div className="py-1">
            {(Object.keys(currencyLabels) as Currency[]).map((c) => (
              <button
                key={`currency-option-${c}`}
                onClick={() => {
                  onChange(c);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor:
                    value === c ? `rgba(var(--accent-primary-rgb), 0.15)` : "transparent",
                  color: value === c ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: value === c ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (value !== c) {
                    e.currentTarget.style.backgroundColor = `rgba(var(--accent-primary-rgb), 0.08)`;
                    e.currentTarget.style.color = "var(--accent-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== c) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
                role="option"
                aria-selected={value === c}
              >
                <div className="flex items-center justify-between">
                  <span>{currencyLabels[c]}</span>
                  {value === c && <Check size={16} style={{ color: "var(--accent-primary)" }} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
