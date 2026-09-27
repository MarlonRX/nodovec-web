import React from "react";
import {
  SimpleLineChart,
  ComposedChartComponent,
  DonutChart,
  StackedBarChart,
  MetricCard,
} from "../../chartComponents";
import { RecentTransactions } from "./RecentTransactions";
import { Panel, PanelTitle } from "./Panel";
import AnimatedProgressCircle from "../AnimatedProgressCircle";
import { translateCategory } from "../../../lib/categoryTranslator";
import { formatCurrency, formatCurrencyWithSign } from "../../../lib/currencyFormatter";
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
      valueNumeric={metrics.raw.balance}
      formatValue={(n) => formatCurrency(n)}
      accent="var(--accent-primary)"
      delay={0}
      trend={cashFlowTrend}
      subtitle={t("dashboard.accumulatedBalance")}
      chart={<SimpleLineChart data={monthlyData} dataKey="cashFlow" height={100} showLegend={false} showGrid={false} showTooltip={false} yAxisDomain={cashFlowDomain} />}
    />
    <MetricCard
      title={t("dashboard.avgMonthlyIncome")}
      value={metrics.income}
      valueNumeric={metrics.raw.income}
      formatValue={(n) => formatCurrency(n)}
      accent="var(--semantic-success)"
      delay={80}
      trend={incomeTrend}
      subtitle={t("dashboard.averagePerMonth")}
      chart={<SimpleLineChart data={monthlyData} dataKey="income" height={100} showLegend={false} showGrid={false} showTooltip={false} yAxisDomain={incomeDomain} />}
    />
    <MetricCard
      title={t("dashboard.avgMonthlyExpenses")}
      value={metrics.expenses}
      valueNumeric={metrics.raw.expenses}
      formatValue={(n) => formatCurrency(n)}
      accent="var(--semantic-error)"
      delay={160}
      trend={expensesTrend}
      subtitle={t("dashboard.averagePerMonth")}
      chart={<SimpleLineChart data={monthlyData} dataKey="expenses" height={100} showLegend={false} showGrid={false} showTooltip={false} yAxisDomain={expensesDomain} />}
    />
    <MetricCard
      title={t("dashboard.netCashFlow")}
      value={metrics.cashFlow}
      valueNumeric={metrics.raw.cashFlow}
      formatValue={(n) => formatCurrencyWithSign(n, true)}
      accent="var(--semantic-info)"
      delay={240}
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
}) => {
  const maxDataValue = monthlyData.reduce((max, m) => {
    const v = Math.max(m.income || 0, m.expenses || 0);
    return v > max ? v : max;
  }, 0);
  const chartYDomain: [number, number] = [0, maxDataValue > 0 ? maxDataValue * 1.1 : 100];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 lg:mb-10">
      <Panel className="lg:col-span-2" delay={120}>
        <PanelTitle
          title={t("dashboard.financialOverview")}
          subtitle={t("dashboard.yearToDateAnalysis")}
        />
        <ComposedChartComponent
          data={monthlyData}
          xAxisKey="month"
          yAxisDomain={chartYDomain}
          bars={[
            { dataKey: "income", fill: "var(--semantic-success)", name: t("dashboard.income") },
            { dataKey: "expenses", fill: "var(--semantic-error)", name: t("dashboard.expenses") },
          ]}
          lines={[
            { dataKey: "cashFlow", stroke: "var(--accent-primary)", strokeWidth: 2, name: t("dashboard.cashFlow") },
          ]}
          height={280}
        />
      </Panel>

      <Panel delay={200}>
        <PanelTitle title={t("dashboard.expenseCategories")} />
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
              <span className="font-semibold flex-shrink-0 ml-2 font-financial" style={{ color: "var(--text-primary)" }}>
                {cat.value}%
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

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
    <Panel delay={160}>
      <PanelTitle title={t("dashboard.accountBalances")} />
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
    </Panel>

    <Panel className="lg:col-span-2" delay={240}>
      <PanelTitle title={t("dashboard.recentTransactions")} />
      <RecentTransactions transactions={recentTransactions} t={t} />
    </Panel>
  </div>
);

interface ActiveSavingsGoalPanelProps {
  goal: SavingsGoal;
  t: (key: string) => string;
}

const ActiveSavingsGoalPanel: React.FC<ActiveSavingsGoalPanelProps> = ({ goal, t }) => (
  <Panel delay={200}>
    <PanelTitle title={t("dashboard.savingsTarget")} />
    <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
      <AnimatedProgressCircle
        percentage={goal.progress_percentage}
        size={110}
        strokeWidth={9}
        color={goal.color}
      />
      <div className="flex-1 w-full min-w-0">
        <p className="text-sm sm:text-base font-bold truncate" style={{ color: "var(--text-primary)" }}>
          {goal.name}
        </p>
        <p className="text-xs sm:text-sm font-financial mb-4" style={{ color: "var(--text-secondary)" }}>
          {goal.formatted_progress.current} / {goal.formatted_progress.target}
        </p>
        <div
          className="inline-flex items-center gap-2 p-2.5 sm:p-3 rounded-none"
          style={{ backgroundColor: "rgba(var(--semantic-success-rgb), 0.06)", border: "1px solid rgba(var(--semantic-success-rgb), 0.19)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--semantic-success)" }}
          />
          <p className="text-xs sm:text-sm m-0" style={{ color: "var(--semantic-success)" }}>
            {t("dashboard.onTrack")}
          </p>
        </div>
      </div>
    </div>
  </Panel>
);
