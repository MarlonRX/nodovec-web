import React from "react";
import {
  SimpleLineChart,
  ComposedChartComponent,
  DonutChart,
  StackedBarChart,
  ProgressBar,
  MetricCard,
} from "../../chartComponents";
import { RecentTransactions } from "./RecentTransactions";
import { translateCategory } from "../../../lib/categoryTranslator";
import type {
  MonthlyData,
  AccountBalance,
  ExpenseCategory,
  Transaction,
} from "../../../services/dashboardService";
import type { SavingsGoal } from "../../../types/savingsGoalInterfaces";

const COLORS = [
  "var(--accent-primary)",
  "var(--semantic-warning)",
  "var(--semantic-error)",
  "var(--semantic-success)",
  "var(--accent-secondary)",
];

interface YearViewProps {
  monthlyData: MonthlyData[];
  accountBalancesData: AccountBalance[];
  expenseCategories: ExpenseCategory[];
  recentTransactions: Transaction[];
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
  cashFlowDomain: [number, number];
  incomeDomain: [number, number];
  expensesDomain: [number, number];
  t: (key: string) => string;
  currentYear: number;
  activeGoal: SavingsGoal | null;
}

const YearView: React.FC<YearViewProps> = ({
  monthlyData,
  accountBalancesData,
  expenseCategories,
  recentTransactions,
  metrics,
  incomeTrend,
  expensesTrend,
  cashFlowTrend,
  cashFlowDomain,
  incomeDomain,
  expensesDomain,
  t,
  currentYear,
  activeGoal,
}) => {
  return (
    <>
      <MetricCardsRow
        monthlyData={monthlyData}
        metrics={metrics}
        incomeTrend={incomeTrend}
        expensesTrend={expensesTrend}
        cashFlowTrend={cashFlowTrend}
        cashFlowDomain={cashFlowDomain}
        incomeDomain={incomeDomain}
        expensesDomain={expensesDomain}
        t={t}
      />
      <MainChartsSection
        monthlyData={monthlyData}
        expenseCategories={expenseCategories}
        t={t}
      />
      <BottomSection
        accountBalancesData={accountBalancesData}
        recentTransactions={recentTransactions}
        t={t}
      />
      {activeGoal && <ActiveSavingsGoalPanel goal={activeGoal} t={t} />}
    </>
  );
};

export default YearView;

interface MetricCardsRowProps {
  monthlyData: MonthlyData[];
  metrics: YearViewProps['metrics'];
  incomeTrend: YearViewProps['incomeTrend'];
  expensesTrend: YearViewProps['expensesTrend'];
  cashFlowTrend: YearViewProps['cashFlowTrend'];
  cashFlowDomain: [number, number];
  incomeDomain: [number, number];
  expensesDomain: [number, number];
  t: (key: string) => string;
}

const MetricCardsRow: React.FC<MetricCardsRowProps> = ({
  monthlyData,
  metrics,
  incomeTrend,
  expensesTrend,
  cashFlowTrend,
  cashFlowDomain,
  incomeDomain,
  expensesDomain,
  t,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-10">
    <MetricCard
      title={t("dashboard.totalBalance")}
      value={metrics.balance}
      trend={cashFlowTrend}
      subtitle={t("dashboard.accumulatedBalance")}
      chart={<SimpleLineChart data={monthlyData} dataKey="cashFlow" height={100} showLegend={false} showGrid={false} showTooltip={false} yAxisDomain={cashFlowDomain} />}
    />
    <MetricCard
      title={t("dashboard.avgMonthlyIncome")}
      value={metrics.income}
      trend={incomeTrend}
      subtitle={t("dashboard.averagePerMonth")}
      chart={<SimpleLineChart data={monthlyData} dataKey="income" height={100} showLegend={false} showGrid={false} showTooltip={false} yAxisDomain={incomeDomain} />}
    />
    <MetricCard
      title={t("dashboard.avgMonthlyExpenses")}
      value={metrics.expenses}
      trend={expensesTrend}
      subtitle={t("dashboard.averagePerMonth")}
      chart={<SimpleLineChart data={monthlyData} dataKey="expenses" height={100} showLegend={false} showGrid={false} showTooltip={false} yAxisDomain={expensesDomain} />}
    />
    <MetricCard
      title={t("dashboard.netCashFlow")}
      value={metrics.cashFlow}
      trend={cashFlowTrend}
      subtitle={t("dashboard.averagePerMonth")}
      chart={<SimpleLineChart data={monthlyData} dataKey="cashFlow" height={100} showLegend={false} showGrid={false} showTooltip={false} yAxisDomain={cashFlowDomain} />}
    />
  </div>
);

interface MainChartsSectionProps {
  monthlyData: MonthlyData[];
  expenseCategories: ExpenseCategory[];
  t: (key: string) => string;
}

const MainChartsSection: React.FC<MainChartsSectionProps> = ({
  monthlyData,
  expenseCategories,
  t,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 lg:mb-10">
    <div
      className="lg:col-span-2 rounded-2xl p-4 sm:p-5 lg:p-7 shadow-md transition-shadow hover:shadow-lg"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-primary)" }}
    >
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          {t("dashboard.financialOverview")}
        </h2>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {t("dashboard.yearToDateAnalysis")}
        </p>
      </div>
      <ComposedChartComponent
        data={monthlyData}
        xAxisKey="month"
        bars={[
          { dataKey: "income", fill: "var(--semantic-success)", name: t("dashboard.income") },
          { dataKey: "expenses", fill: "var(--semantic-error)", name: t("dashboard.expenses") },
        ]}
        lines={[
          { dataKey: "cashFlow", stroke: "var(--accent-primary)", strokeWidth: 2, name: t("dashboard.cashFlow") },
        ]}
        height={280}
      />
    </div>

    <div
      className="rounded-2xl p-4 sm:p-5 lg:p-7 shadow-md transition-shadow hover:shadow-lg"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-primary)" }}
    >
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 lg:mb-8" style={{ color: "var(--text-primary)" }}>
        {t("dashboard.expenseCategories")}
      </h2>
      <DonutChart data={expenseCategories} colors={COLORS} innerRadius={40} outerRadius={70} paddingAngle={2} height={180} showLegend={false} />
      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {expenseCategories.map((cat, idx) => (
          <div key={cat.name} className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx] }} />
              <span className="truncate" style={{ color: "var(--text-secondary)" }}>
                {translateCategory(cat.name, t)}
              </span>
            </div>
            <span className="font-semibold flex-shrink-0 ml-2" style={{ color: "var(--text-primary)" }}>
              {cat.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface BottomSectionProps {
  accountBalancesData: AccountBalance[];
  recentTransactions: Transaction[];
  t: (key: string) => string;
}

const BottomSection: React.FC<BottomSectionProps> = ({
  accountBalancesData,
  recentTransactions,
  t,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 lg:mb-10">
    <div
      className="rounded-2xl p-4 sm:p-5 lg:p-7 shadow-md transition-shadow hover:shadow-lg"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-primary)" }}
    >
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 lg:mb-8" style={{ color: "var(--text-primary)" }}>
        {t("dashboard.accountBalances")}
      </h2>
      <StackedBarChart
        data={accountBalancesData}
        xAxisKey="month"
        bars={[
          { dataKey: "savings", fill: "var(--accent-primary)", name: t("dashboard.savings") },
          { dataKey: "other", fill: "var(--accent-secondary)", name: t("dashboard.other") },
          { dataKey: "expense", fill: "var(--semantic-warning)", name: t("dashboard.expense") },
          { dataKey: "tax", fill: "var(--semantic-success)", name: t("dashboard.tax") },
        ]}
        height={240}
      />
    </div>

    <div
      className="lg:col-span-2 rounded-2xl p-4 sm:p-5 lg:p-7 shadow-md transition-shadow hover:shadow-lg"
      style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-primary)" }}
    >
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: "var(--text-primary)" }}>
        {t("dashboard.recentTransactions")}
      </h2>
      <RecentTransactions transactions={recentTransactions} t={t} />
    </div>
  </div>
);

interface ActiveSavingsGoalPanelProps {
  goal: SavingsGoal;
  t: (key: string) => string;
}

const ActiveSavingsGoalPanel: React.FC<ActiveSavingsGoalPanelProps> = ({ goal, t }) => (
  <div
    className="rounded-2xl p-4 sm:p-5 lg:p-7 shadow-md transition-shadow hover:shadow-lg"
    style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-primary)" }}
  >
    <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: "var(--text-primary)" }}>
      {t("dashboard.savingsTarget")}
    </h2>
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: goal.color }}>
            <span className="text-white text-xs font-bold">{goal.progress_percentage}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {goal.name}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {goal.formatted_progress.current} / {goal.formatted_progress.target}
            </p>
          </div>
        </div>
        <ProgressBar label="" value={goal.current_amount} max={goal.target_amount} color={goal.color} />
      </div>
      <div
        className="p-3 sm:p-4 rounded-lg"
        style={{ backgroundColor: "rgba(var(--semantic-success-rgb), 0.06)", border: "1px solid rgba(var(--semantic-success-rgb), 0.19)" }}
      >
        <p className="text-xs sm:text-sm" style={{ color: "var(--semantic-success)" }}>
          {t("dashboard.onTrack")}
        </p>
      </div>
    </div>
  </div>
);
