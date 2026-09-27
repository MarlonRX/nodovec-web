import React from "react";
import { MySelect } from "../../UIComponents/MySelect";
import SplitText from "../../reactbits/SplitText";
import ShinyText from "../../reactbits/ShinyText";
import ThemedAurora from "../../reactbits/ThemedAurora";
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
}) => {
  const subtitle =
    viewMode === "year"
      ? t("dashboard.yearOverview").replace("{year}", String(currentYear))
      : t("dashboard.monthView")
          .replace("{month}", monthlyData[selectedMonth]?.month || "")
          .replace("{year}", String(currentYear));

  return (
    <div
      className="relative border-b shrink-0 overflow-hidden"
      style={{
        borderColor: "var(--border-primary)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <ThemedAurora amplitude={0.9} blend={0.6} speed={0.8} />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, var(--bg-surface) 100%)",
        }}
      />
      <div className="relative z-10 max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="min-w-0">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              <SplitText text={t("dashboard.title")} />
            </h1>
            <ShinyText
              text={subtitle}
              speed={4}
              className="text-xs sm:text-sm"
              color="var(--text-secondary)"
              shineColor="var(--text-primary)"
            />
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
};
