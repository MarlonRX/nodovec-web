import React from "react";
import ClickSpark from "./ClickSpark";
import { useCssColor } from "./useCssColor";

interface SparkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  sparkColor?: string;
  wrapperClassName?: string;
}

export default function SparkButton({
  icon,
  sparkColor,
  wrapperClassName = "w-full sm:w-auto",
  children,
  className = "",
  type = "button",
  ...rest
}: SparkButtonProps) {
  const accent = useCssColor("--accent-primary", "#ff6b45");

  return (
    <ClickSpark sparkColor={sparkColor ?? accent} className={wrapperClassName}>
      <button
        type={type}
        className={`btn-shine group flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-none font-semibold text-xs md:text-sm w-full transition-colors bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) ${className}`}
        {...rest}
      >
        {icon && (
          <span className="flex transition-transform group-hover:rotate-90">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    </ClickSpark>
  );
}
