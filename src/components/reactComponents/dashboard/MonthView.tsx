import React from "react";
import SimpleLineChart from "../../chartComponents/SimpleLineChart";
import DonutChart from "../../chartComponents/DonutChart";
import MetricCard from "../../chartComponents/MetricCard";
import { RecentTransactions } from "./RecentTransactions";
import { Panel, PanelTitle } from "./Panel";
import CountUp from "../../reactbits/CountUp";
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
    raw: {
      balance: number;
      income: number;
      expenses: number;
      cashFlow: number;
    };
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <MetricCard
          title={t("dashboard.monthlyIncome")}
          value={metrics.income}
          valueNumeric={month.income || 0}
          formatValue={(n) => formatCurrency(n)}
          accent="var(--semantic-success)"
          delay={0}
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
          valueNumeric={month.expenses || 0}
          formatValue={(n) => formatCurrency(n)}
          accent="var(--semantic-error)"
          delay={80}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8 lg:mb-10">
        <Panel delay={120}>
          <PanelTitle
            title={`${month.month} ${currentYear} ${t("dashboard.summary") || "Summary"}`}
            subtitle={t("dashboard.financialBreakdown") || "Financial breakdown"}
          />

          <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div
              className="p-3 sm:p-4 rounded-none"
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
                className="text-lg sm:text-2xl font-bold mt-1 font-financial"
                style={{ color: "var(--semantic-success)" }}
              >
                <CountUp to={month.income || 0} format={(n) => formatCurrency(n)} duration={1.5} />
              </p>
            </div>
            <div
              className="p-3 sm:p-4 rounded-none"
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
                className="text-lg sm:text-2xl font-bold mt-1 font-financial"
                style={{ color: "var(--semantic-error)" }}
              >
                <CountUp to={month.expenses || 0} format={(n) => formatCurrency(n)} duration={1.5} />
              </p>
            </div>
            <div
              className="p-3 sm:p-4 rounded-none"
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
                className="text-lg sm:text-2xl font-bold mt-1 font-financial"
                style={{ color: "var(--accent-primary)" }}
              >
                <CountUp
                  to={month.cashFlow || 0}
                  format={(n) => formatCurrencyWithSign(n, true)}
                  duration={1.5}
                />
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
                  key={cat.name}
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
                    className="font-semibold flex-shrink-0 ml-2 font-financial"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cat.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="flex flex-col" delay={200}>
          <PanelTitle title={t("dashboard.recentTransactions")} className="mb-3 sm:mb-4" />
          <div className="flex-1 min-h-0">
            <RecentTransactions
              transactions={monthTransactions}
              t={t}
              compact
            />
          </div>
        </Panel>
      </div>
    </>
  );
};

export default MonthView;
