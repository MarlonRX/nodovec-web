import React from "react";
import { BentoCard } from "../../reactbits/MagicBento";

interface PanelProps extends React.PropsWithChildren {
  className?: string;
  delay?: number;
}

export const Panel: React.FC<PanelProps> = ({ className = "", delay = 0, children }) => (
  <BentoCard
    className={`glass-panel animate-fade-up rounded-none p-4 sm:p-5 lg:p-7 ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </BentoCard>
);

interface PanelTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const PanelTitle: React.FC<PanelTitleProps> = ({ title, subtitle, className = "" }) => (
  <div className={`mb-4 sm:mb-6 ${className}`}>
    <div className="flex items-center gap-2.5">
      <span
        className="inline-block w-1 h-5 shrink-0"
        style={{ background: "linear-gradient(180deg, var(--accent-primary), var(--accent-hover))" }}
      />
      <h2
        className="text-lg sm:text-xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
    </div>
    {subtitle && (
      <p className="text-xs mt-1 ml-3.5" style={{ color: "var(--text-secondary)" }}>
        {subtitle}
      </p>
    )}
  </div>
);
