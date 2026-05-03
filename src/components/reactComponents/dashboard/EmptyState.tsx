import React from "react";

interface EmptyStateProps {
  t: (key: string) => string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ t }) => (
  <div
    className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 py-12"
    style={{ backgroundColor: "var(--bg-primary)" }}
  >
    <div className="text-center max-w-xs">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{
          backgroundColor: "rgba(var(--accent-primary-rgb), 0.125)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(var(--accent-primary-rgb), 0.25)",
          }}
        >
          <span className="text-2xl">📊</span>
        </div>
      </div>
      <h2
        className="text-xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {t("dashboard.emptyTitle")}
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {t("dashboard.emptyMessage")}
      </p>
      <a
        href="/transactions/table"
        className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
        style={{
          backgroundColor: "var(--accent-primary)",
          color: "var(--text-inverted)",
        }}
      >
        {t("dashboard.addFirstTransaction")}
      </a>
    </div>
  </div>
);
