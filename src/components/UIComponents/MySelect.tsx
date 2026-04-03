import React from "react";

interface MySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export const MySelect = React.forwardRef<HTMLSelectElement, MySelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-(--text-primary)">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 border border-(--border-primary) rounded-md bg-(--bg-surface) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) transition-all cursor-pointer ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${className || ""}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

MySelect.displayName = "MySelect";
