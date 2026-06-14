import React from "react";
import { MySelect } from "../../UIComponents/MySelect";
import type { MonthlyData } from "../../../services/dashboardService";

interface DashboardHeaderProps {
  viewMode: "month" | "year";
  onViewModeChange: (mode: "month" | "year") => void;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  monthlyData: MonthlyData[];
  currentYear: number;
  t: (key: string) => string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  viewMode,
  onViewModeChange,
  selectedMonth,
  onMonthChange,
  selectedAccount,
  onAccountChange,
  monthlyData,
  currentYear,
  t,
}) => (
  <div
    className="border-b shrink-0"
    style={{
      borderColor: "var(--border-primary)",
      background: `linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-primary) 100%)`,
    }}
  >
    <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            {t("dashboard.title")}
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
            {viewMode === "year"
              ? t("dashboard.yearOverview").replace("{year}", String(currentYear))
              : t("dashboard.monthView")
                  .replace("{month}", monthlyData[selectedMonth]?.month || "")
                  .replace("{year}", String(currentYear))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <MySelect
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value as "month" | "year")}
            options={[
              { value: "year", label: t("dashboard.yearly") },
              { value: "month", label: t("dashboard.monthly") },
            ]}
            className="min-w-[100px] flex-1 sm:flex-none"
          />
          {viewMode === "month" && (
            <MySelect
              value={selectedMonth.toString()}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              options={monthlyData.map((data, idx) => ({
                value: idx.toString(),
                label: data.month,
              }))}
              className="min-w-[100px] flex-1 sm:flex-none"
            />
          )}
          <MySelect
            value={selectedAccount}
            onChange={(e) => onAccountChange(e.target.value)}
            options={[
              { value: "personal", label: t("dashboard.personal") },
              { value: "business", label: t("dashboard.business") },
              { value: "investments", label: t("dashboard.investments") },
            ]}
            className="min-w-[100px] flex-1 sm:flex-none"
          />
        </div>
      </div>
    </div>
  </div>
);
