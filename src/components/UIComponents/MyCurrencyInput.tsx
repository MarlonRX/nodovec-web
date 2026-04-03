import React, { useState, useEffect } from "react";
import Decimal from "decimal.js";

interface MyCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MyCurrencyInput = React.forwardRef<HTMLInputElement, MyCurrencyInputProps>(
  ({ label, error, className, onChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>("");

    // Sincronizar displayValue cuando cambia el value prop
    useEffect(() => {
      if (value === undefined || value === null || value === "") {
        setDisplayValue("");
      } else {
        try {
          const decimal = new Decimal(String(value));
          setDisplayValue(formatCurrency(decimal.toString()));
        } catch {
          setDisplayValue("");
        }
      }
    }, [value]);

    const formatCurrency = (val: string): string => {
      if (!val) return "";

      const parts = val.split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const decimalPart = parts[1] || "";

      return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Solo permitir números y punto decimal
      inputValue = inputValue.replace(/[^\d.]/g, "");

      // Asegurar que solo haya un punto decimal
      const parts = inputValue.split(".");
      if (parts.length > 2) {
        inputValue = parts[0] + "." + parts.slice(1).join("");
      }

      // Limitar a 2 decimales
      if (parts.length === 2) {
        parts[1] = parts[1].substring(0, 2);
        inputValue = parts.join(".");
      }

      // Validar y convertir con Decimal para precisión
      let cleanValue = inputValue;
      if (inputValue && inputValue !== ".") {
        try {
          const decimal = new Decimal(inputValue);
          cleanValue = decimal.toString();
          setDisplayValue(formatCurrency(cleanValue));
        } catch {
          setDisplayValue(formatCurrency(inputValue));
        }
      } else {
        setDisplayValue("");
      }

      // Pasar el valor limpio al onChange
      const cleanEvent = {
        ...e,
        target: {
          ...e.target,
          value: cleanValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      if (onChange) {
        onChange(cleanEvent);
      }
    };

    const displayVal = displayValue;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-(--text-primary)">
            {label}
          </label>
        )}
        <input
          ref={ref}
          autoComplete="off"
          type="text"
          inputMode="decimal"
          className={`w-full px-3 py-2 border border-(--border-primary) rounded-md bg-(--bg-surface) text-(--text-primary) placeholder-text-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) transition-all ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${className || ""}`}
          value={displayVal}
          onChange={handleChange}
          placeholder="0.00"
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

MyCurrencyInput.displayName = "MyCurrencyInput";
