import React from "react";

interface ErrorStateProps {
  error: string | null;
  onReload: () => void;
  t: (key: string) => string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onReload, t }) => (
  <div
    className="w-full h-[60vh] flex items-center justify-center px-4"
    style={{ backgroundColor: "var(--bg-primary)" }}
  >
    <div className="text-center max-w-sm">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: "rgba(207, 102, 121, 0.1)" }}
      >
        <span className="text-2xl">⚠️</span>
      </div>
      <p
        className="text-base font-bold mb-2"
        style={{ color: "var(--semantic-error)" }}
      >
        {error || t("dashboard.failedToLoad")}
      </p>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        {t("dashboard.loadError")}
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={onReload}
          className="px-4 py-2 rounded-none text-sm font-semibold transition-colors"
          style={{
            backgroundColor: "var(--accent-primary)",
            color: "var(--text-inverted)",
          }}
        >
          {t("dashboard.tryAgain")}
        </button>
        <a
          href="/"
          className="px-4 py-2 rounded-none text-sm font-semibold transition-colors"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-primary)",
          }}
        >
          {t("dashboard.goHome")}
        </a>
      </div>
    </div>
  </div>
);
