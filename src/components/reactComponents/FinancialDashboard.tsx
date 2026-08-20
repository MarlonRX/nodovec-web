import React, { useState, useEffect, Suspense } from "react";
import { getDashboardData, filterTransactionsByMonth, type DashboardData } from "../../services/dashboardService";
import { getGoals } from "../../services/savingsGoalServices";
import type { SavingsGoal } from "../../types/savingsGoalInterfaces";
import { formatCurrency, formatCurrencyWithSign } from "../../lib/currencyFormatter";
import { translate, getCurrentLanguage, type Language } from "../../i18n";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { LoadingState } from "./dashboard/LoadingState";
import { ErrorState } from "./dashboard/ErrorState";
import { EmptyState } from "./dashboard/EmptyState";

// Lazy load view components — only one is rendered at a time
const YearView = React.lazy(() => import("./dashboard/YearView"));
const MonthView = React.lazy(() => import("./dashboard/MonthView"));

const FinancialDashboard = () => {
  const [viewMode, setViewMode] = useState<"month" | "year">("year");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedAccount, setSelectedAccount] = useState<string>("personal");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = (key: string) => translate(key, lang);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const onLangChange = (e: Event) =>
      setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLangChange);
    return () => window.removeEventListener("languageChanged", onLangChange);
  }, []);

  // Extract loadData so it can be called on demand (event-driven refresh)
  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, goalsRes] = await Promise.all([
        getDashboardData(),
        getGoals({ status: "active", page_size: 5 }),
      ]);
      setDashboardData(data);
      if (goalsRes.response && goalsRes.data?.data) {
        setSavingsGoals(goalsRes.data.data);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to load dashboard: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for transactionCreated event to refresh dashboard data
  useEffect(() => {
    const onTransactionCreated = () => {
      loadData();
    };
    window.addEventListener("transactionCreated", onTransactionCreated);
    return () => window.removeEventListener("transactionCreated", onTransactionCreated);
  }, [loadData]);

  if (isLoading) {
    return <LoadingState message={t("dashboard.loading")} />;
  }

  if (error || !dashboardData) {
    return (
      <ErrorState
        error={error}
        onReload={() => window.location.reload()}
        t={t}
      />
    );
  }

  const { monthlyData, accountBalancesData, expenseCategories, recentTransactions, allTransactions } =
    dashboardData;

  const hasTransactions = recentTransactions && recentTransactions.length > 0;
  if (!hasTransactions) {
    return <EmptyState t={t} />;
  }

  // Find the most recent active savings goal (last created, not completed)
  const activeGoal = savingsGoals.find((g) => !g.is_completed) || null;

  // Filter transactions for selected month (used in MonthView)
  const monthTransactions = filterTransactionsByMonth(
    allTransactions || recentTransactions,
    selectedMonth
  ).slice(0, 7);

  // ── Calculations ────────────────────────────────────────────
  const calculateAnnualTotals = () => {
    const totalIncome = monthlyData.reduce(
      (sum, m) => sum + (m.income || 0),
      0
    );
    const totalExpenses = monthlyData.reduce(
      (sum, m) => sum + (m.expenses || 0),
      0
    );
    const totalCashFlow = totalIncome - totalExpenses;
    const monthsWithData = monthlyData.filter(
      (m) => (m.income || 0) > 0 || (m.expenses || 0) > 0
    ).length;
    const divisor = monthsWithData > 0 ? monthsWithData : 12;

    return {
      income: isFinite(totalIncome) ? totalIncome : 0,
      expenses: isFinite(totalExpenses) ? totalExpenses : 0,
      cashFlow: isFinite(totalCashFlow) ? totalCashFlow : 0,
      avgMonthlyIncome: isFinite(totalIncome / divisor)
        ? Math.round(totalIncome / divisor)
        : 0,
      avgMonthlyExpenses: isFinite(totalExpenses / divisor)
        ? Math.round(totalExpenses / divisor)
        : 0,
      avgMonthlyCashFlow: isFinite(totalCashFlow / divisor)
        ? Math.round(totalCashFlow / divisor)
        : 0,
    };
  };

  const getDisplayMetrics = () => {
    if (viewMode === "year") {
      const annuals = calculateAnnualTotals();
      const totalBalance = isFinite(annuals.income - annuals.expenses)
        ? annuals.income - annuals.expenses
        : 0;
      return {
        balance: formatCurrency(totalBalance),
        income: formatCurrency(annuals.avgMonthlyIncome),
        expenses: formatCurrency(annuals.avgMonthlyExpenses),
        cashFlow: formatCurrencyWithSign(annuals.avgMonthlyCashFlow, true),
        subtitle: t("dashboard.annualOverview"),
      };
    } else {
      const month = monthlyData[selectedMonth] || {
        income: 0,
        expenses: 0,
        cashFlow: 0,
      };
      const monthBalance = (month.income || 0) - (month.expenses || 0);
      return {
        balance: formatCurrency(isFinite(monthBalance) ? monthBalance : 0),
        income: formatCurrency(month.income || 0),
        expenses: formatCurrency(month.expenses || 0),
        cashFlow: formatCurrencyWithSign(month.cashFlow || 0, true),
        subtitle: `${monthlyData[selectedMonth]?.month || "N/A"} ${currentYear}`,
      };
    }
  };

  const metrics = getDisplayMetrics();

  const calculateYAxisDomain = (dataKey: string): [number, number] => {
    const values = monthlyData.reduce<number[]>((acc, item) => {
      const v = item[dataKey] || 0;
      if (typeof v === "number" && isFinite(v)) acc.push(v);
      return acc;
    }, []);
    const maxValue = values.length > 0 ? Math.max(...values) : 100;
    const normalizedMax =
      isFinite(maxValue) && maxValue > 0 ? maxValue : 100;
    return [0, normalizedMax];
  };

  const calculateTrendPercentage = (
    dataKey: string
  ): { value: number; isPositive: boolean } => {
    const midPoint = Math.floor(monthlyData.length / 2);
    const firstHalf = monthlyData.slice(0, midPoint);
    const secondHalf = monthlyData.slice(midPoint);

    const firstHalfAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((sum, m) => sum + (m[dataKey] || 0), 0) /
        firstHalf.length
        : 0;
    const secondHalfAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((sum, m) => sum + (m[dataKey] || 0), 0) /
        secondHalf.length
        : 0;

    if (firstHalfAvg === 0) {
      return { value: 0, isPositive: secondHalfAvg >= 0 };
    }
    const percentageChange =
      ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    const roundedValue = isFinite(percentageChange)
      ? Math.round(Math.abs(percentageChange) * 100) / 100
      : 0;
    return {
      value: roundedValue,
      isPositive: percentageChange >= 0,
    };
  };

  const incomeTrend = calculateTrendPercentage("income");
  const expensesTrend = calculateTrendPercentage("expenses");
  const cashFlowTrend = calculateTrendPercentage("cashFlow");

  const cashFlowDomain = calculateYAxisDomain("cashFlow");
  const incomeDomain = calculateYAxisDomain("income");
  const expensesDomain = calculateYAxisDomain("expenses");

  return (
    <div
      className="w-full min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <DashboardHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        monthlyData={monthlyData}
        currentYear={currentYear}
        t={t}
      />

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-32">
          <Suspense
            fallback={
              <LoadingState message={t("dashboard.loadingView") || "Loading view..."} />
            }
          >
            {viewMode === "year" ? (
              <YearView
                monthlyData={monthlyData}
                accountBalancesData={accountBalancesData}
                expenseCategories={expenseCategories}
                recentTransactions={recentTransactions}
                metrics={metrics}
                incomeTrend={incomeTrend}
                expensesTrend={expensesTrend}
                cashFlowTrend={cashFlowTrend}
                cashFlowDomain={cashFlowDomain}
                incomeDomain={incomeDomain}
                expensesDomain={expensesDomain}
                t={t}
                currentYear={currentYear}
                activeGoal={activeGoal}
              />
            ) : (
              <MonthView
                monthlyData={monthlyData}
                expenseCategories={expenseCategories}
                monthTransactions={monthTransactions}
                selectedMonth={selectedMonth}
                metrics={metrics}
                incomeTrend={incomeTrend}
                expensesTrend={expensesTrend}
                cashFlowTrend={cashFlowTrend}
                incomeDomain={incomeDomain}
                expensesDomain={expensesDomain}
                t={t}
                currentYear={currentYear}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
