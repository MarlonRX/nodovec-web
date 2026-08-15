import React from "react";
import { cn } from "@/lib/utils";

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
          className={cn(
            "w-full px-3 py-2 rounded-lg border text-sm",
            "bg-(--bg-surface) text-(--text-primary) placeholder:text-(--text-secondary)",
            "border-(--border-primary) focus:border-(--accent-primary) focus:ring-2 focus:ring-(--accent-primary)/30",
            "outline-none transition-all duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            className
          )}
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
