import React from "react";
import {
  SimpleLineChart,
  DonutChart,
  MetricCard,
} from "../../chartComponents";
import { RecentTransactions } from "./RecentTransactions";
import { formatCurrency, formatCurrencyWithSign } from "../../../lib/currencyFormatter";
import { translateCategory } from "../../../lib/categoryTranslator";
import type {
  MonthlyData,
  ExpenseCategory,
  Transaction,
} from "../../../services/dashboardService";

const COLORS = [
  "var(--accent-primary)",
  "var(--semantic-warning)",
  "var(--semantic-error)",
  "var(--semantic-success)",
  "var(--accent-secondary)",
];

interface MonthViewProps {
  monthlyData: MonthlyData[];
  expenseCategories: ExpenseCategory[];
  monthTransactions: Transaction[];
  selectedMonth: number;
  metrics: {
    balance: string;
    income: string;
    expenses: string;
    cashFlow: string;
    subtitle: string;
  };
  incomeTrend: { value: number; isPositive: boolean };
  expensesTrend: { value: number; isPositive: boolean };
  cashFlowTrend: { value: number; isPositive: boolean };
  incomeDomain: [number, number];
  expensesDomain: [number, number];
  t: (key: string) => string;
  currentYear: number;
}

const MonthView: React.FC<MonthViewProps> = ({
  monthlyData,
  expenseCategories,
  monthTransactions,
  selectedMonth,
  metrics,
  incomeTrend,
  expensesTrend,
  cashFlowTrend,
  incomeDomain,
  expensesDomain,
  t,
  currentYear,
}) => {
  const month = monthlyData[selectedMonth] || {
    income: 0,
    expenses: 0,
    cashFlow: 0,
    month: "N/A",
  };

  return (
    <>
      {/* Monthly Metrics - 2 wide columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <MetricCard
          title={t("dashboard.monthlyIncome")}
          value={metrics.income}
          trend={incomeTrend}
          subtitle={t("dashboard.thisMonth")}
          chart={
            <SimpleLineChart
              data={monthlyData}
              dataKey="income"
              height={80}
              showLegend={false}
              showGrid={false}
              showTooltip={false}
              yAxisDomain={incomeDomain}
            />
          }
        />
        <MetricCard
          title={t("dashboard.monthlyExpenses")}
          value={metrics.expenses}
          trend={expensesTrend}
          subtitle={t("dashboard.thisMonth")}
          chart={
            <SimpleLineChart
              data={monthlyData}
              dataKey="expenses"
              height={80}
              showLegend={false}
              showGrid={false}
              showTooltip={false}
              yAxisDomain={expensesDomain}
            />
          }
        />
      </div>

      {/* Monthly Summary and Recent Transactions - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8 lg:mb-10">
        {/* Monthly Overview */}
        <div
          className="rounded-xl p-4 sm:p-5 lg:p-7 shadow-md transition-shadow hover:shadow-lg"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1.5px solid var(--border-primary)",
          }}
        >
          <div className="mb-4 sm:mb-6">
            <h2
              className="text-base sm:text-lg lg:text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {month.month} {currentYear} {t("dashboard.summary") || "Summary"}
            </h2>
            <p
              className="text-xs sm:text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("dashboard.financialBreakdown") || "Financial breakdown"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div
              className="p-3 sm:p-4 rounded-lg"
              style={{
                backgroundColor: "rgba(var(--semantic-success-rgb), 0.06)",
                border: "1px solid rgba(var(--semantic-success-rgb), 0.19)",
              }}
            >
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("dashboard.income")}
              </p>
              <p
                className="text-lg sm:text-2xl font-bold mt-1"
                style={{ color: "var(--semantic-success)" }}
              >
                {formatCurrency(month.income)}
              </p>
            </div>
            <div
              className="p-3 sm:p-4 rounded-lg"
              style={{
                backgroundColor: "rgba(var(--semantic-error-rgb), 0.06)",
                border: "1px solid rgba(var(--semantic-error-rgb), 0.19)",
              }}
            >
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("dashboard.expenses")}
              </p>
              <p
                className="text-lg sm:text-2xl font-bold mt-1"
                style={{ color: "var(--semantic-error)" }}
              >
                {formatCurrency(month.expenses)}
              </p>
            </div>
            <div
              className="p-3 sm:p-4 rounded-lg"
              style={{
                backgroundColor: "rgba(var(--accent-primary-rgb), 0.06)",
                border: "1px solid rgba(var(--accent-primary-rgb), 0.19)",
              }}
            >
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("dashboard.netCashFlow")}
              </p>
              <p
                className="text-lg sm:text-2xl font-bold mt-1"
                style={{ color: "var(--accent-primary)" }}
              >
                {formatCurrencyWithSign(month.cashFlow, true)}
              </p>
            </div>
          </div>

          <div>
            <h3
              className="text-sm sm:text-base font-bold mb-2 sm:mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              {t("dashboard.expenseCategories")}
            </h3>
            <DonutChart
              data={expenseCategories}
              colors={COLORS}
              innerRadius={30}
              outerRadius={55}
              paddingAngle={2}
              height={140}
              showLegend={false}
            />
            <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
              {expenseCategories.map((cat, idx) => (
                <div
                  key={`expense-category-${idx}`}
                  className="flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <span
                      className="truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {translateCategory(cat.name, t)}
                    </span>
                  </div>
                  <span
                    className="font-semibold flex-shrink-0 ml-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cat.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          className="rounded-xl p-4 sm:p-5 lg:p-7 shadow-md transition-shadow hover:shadow-lg flex flex-col"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1.5px solid var(--border-primary)",
          }}
        >
          <h2
            className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {t("dashboard.recentTransactions")}
          </h2>
          <div className="flex-1 min-h-0">
            <RecentTransactions
              transactions={monthTransactions}
              t={t}
              compact
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MonthView;
