import React from "react";

interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const MyInput = React.forwardRef<HTMLInputElement, MyInputProps>(
  ({ label, error, className, ...props }, ref) => {
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
          className={`w-full px-3 py-2 border border-(--border-primary) rounded-md bg-(--bg-surface) text-(--text-primary) placeholder-text-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-(--accent-primary) transition-all ${
            error ? "border-red-500 focus:ring-red-500" : ""
          } ${className || ""}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

MyInput.displayName = "MyInput";
