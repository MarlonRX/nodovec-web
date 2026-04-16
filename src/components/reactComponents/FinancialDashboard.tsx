import React, { useState, useEffect } from "react";
import { RotateCw } from "lucide-react";
import {
    SimpleLineChart,
    ComposedChartComponent,
    DonutChart,
    StackedBarChart,
    ProgressBar,
    MetricCard,
} from "../chartComponents";
import { TransactionIcon } from "./TransactionIcon";
import { MySelect } from "../UIComponents/MySelect";
import { getDashboardData, type DashboardData } from "../../services/dashboardService";
import { formatCurrency, formatCurrencyWithSign } from "../../lib/currencyFormatter";
import { translate, getCurrentLanguage, type Language } from "../../i18n";

const FinancialDashboard = () => {
    const [viewMode, setViewMode] = useState<"month" | "year">("year");
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState<string>("personal");
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lang, setLang] = useState<Language>(getCurrentLanguage());
    const t = (key: string) => translate(key, lang);
    const currentYear = new Date().getFullYear();

    // Check if component is hydrated on client-side
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Sync language changes
    useEffect(() => {
        const onLangChange = (e: Event) => setLang((e as CustomEvent).detail as Language);
        window.addEventListener("languageChanged", onLangChange);
        return () => window.removeEventListener("languageChanged", onLangChange);
    }, []);

    // Load dashboard data on component mount (client-side only)
    useEffect(() => {
        if (!isHydrated) return;

        setSelectedMonth(new Date().getMonth());

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                console.log('[FinancialDashboard] Fetching dashboard data...');
                const data = await getDashboardData();
                console.log('[FinancialDashboard] Dashboard data loaded successfully:', data);
                setDashboardData(data);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error("[FinancialDashboard] Error loading dashboard data:", errorMsg, err);
                setError(`Failed to load dashboard: ${errorMsg}`);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [isHydrated]);

    // Early return if data is still loading or not hydrated
    if (!isHydrated || isLoading) {
        return (
            <div
                className="w-full h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-transparent animate-spin"
                        style={{
                            borderTopColor: 'var(--accent-primary)',
                            borderRightColor: 'var(--accent-primary)',
                        }} 
                    ></div>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {!isHydrated ? t('dashboard.initializing') : t('dashboard.loading')}
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !dashboardData) {
        const handleReload = () => {
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        };

        return (
            <div
                className="w-full h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div className="text-center max-w-md">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: 'rgba(207, 102, 121, 0.1)' }}
                    >
                        <span style={{ fontSize: '32px' }}>⚠️</span>
                    </div>
                    <p style={{ color: 'var(--semantic-error)' }} className="text-lg font-bold mb-2">
                        {error || t('dashboard.failedToLoad')}
                    </p>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-6">
                        {t('dashboard.loadError')}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleReload}
                            className="px-4 py-2 rounded-lg transition-all"
                            style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: 'var(--text-inverted)',
                            }}
                        >
                            {t('dashboard.tryAgain')}
                        </button>
                        <a
                            href="/"
                            className="px-4 py-2 rounded-lg transition-all"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            }}
                        >
                            {t('dashboard.goHome')}
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const monthlyData = dashboardData.monthlyData;
    const accountBalancesData = dashboardData.accountBalancesData;
    const expenseCategories = dashboardData.expenseCategories;
    const recentTransactions = dashboardData.recentTransactions;

    // Check if this is an empty dashboard (no transactions for authenticated user)
    const hasTransactions = recentTransactions && recentTransactions.length > 0;

    // Empty state for users with no transactions
    if (!hasTransactions) {
        return (
            <div
                className="w-full h-screen flex flex-col items-center justify-center gap-6 p-8"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <div className="text-center max-w-md">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.125)' }} 
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.25)' }} 
                        >
                            <span style={{ fontSize: "32px" }}>📊</span>
                        </div>
                    </div>
                    <h2
                        className="text-2xl font-bold mb-3"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {t('dashboard.emptyTitle')}
                    </h2>
                    <p
                        className="text-sm mb-8"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {t('dashboard.emptyMessage')}
                    </p>
                    <a
                        href="/transactions/table"
                        className="inline-block px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                        style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--text-inverted)',
                        }}
                    >
                        {t('dashboard.addFirstTransaction')}
                    </a>
                </div>
            </div>
        );
    }

    const COLORS = [
        'var(--accent-primary)',
        'var(--semantic-warning)',
        'var(--semantic-error)',
        'var(--semantic-success)',
        'var(--accent-secondary)',
    ];
    const calculateAnnualTotals = () => {
        const totalIncome = monthlyData.reduce((sum, month) => sum + (month.income || 0), 0);
        const totalExpenses = monthlyData.reduce((sum, month) => sum + (month.expenses || 0), 0);
        const totalCashFlow = totalIncome - totalExpenses;
        
        // Count months that have transactions (non-zero values)
        const monthsWithData = monthlyData.filter(
            month => (month.income || 0) > 0 || (month.expenses || 0) > 0
        ).length;
        
        // Use months with data for average, or 12 if no months have data
        const divisor = monthsWithData > 0 ? monthsWithData : 12;
        
        const avgMonthlyIncome = isFinite(totalIncome / divisor) ? Math.round(totalIncome / divisor) : 0;
        const avgMonthlyExpenses = isFinite(totalExpenses / divisor) ? Math.round(totalExpenses / divisor) : 0;
        const avgMonthlyCashFlow = isFinite(totalCashFlow / divisor) ? Math.round(totalCashFlow / divisor) : 0;
        
        return {
            income: isFinite(totalIncome) ? totalIncome : 0,
            expenses: isFinite(totalExpenses) ? totalExpenses : 0,
            cashFlow: isFinite(totalCashFlow) ? totalCashFlow : 0,
            avgMonthlyIncome,
            avgMonthlyExpenses,
            avgMonthlyCashFlow,
        };
    };

    const getCurrentData = () => {
        if (viewMode === "year") {
            return monthlyData;
        } else {
            return [monthlyData[selectedMonth]];
        }
    };

    const getDisplayMetrics = () => {
        if (viewMode === "year") {
            const annuals = calculateAnnualTotals();
            // Standard balance equation: Total Income - Total Expenses
            const totalBalance = isFinite(annuals.income - annuals.expenses) ? annuals.income - annuals.expenses : 0;
            return {
                balance: formatCurrency(totalBalance),
                income: formatCurrency(annuals.avgMonthlyIncome),
                expenses: formatCurrency(annuals.avgMonthlyExpenses),
                cashFlow: formatCurrencyWithSign(annuals.avgMonthlyCashFlow, true),
                subtitle: t('dashboard.annualOverview'),
            };
        } else {
            const month = monthlyData[selectedMonth] || { income: 0, expenses: 0, cashFlow: 0 };
            // Standard balance equation: Monthly Income - Monthly Expenses
            const monthBalance = (month.income || 0) - (month.expenses || 0);
            return {
                balance: formatCurrency(isFinite(monthBalance) ? monthBalance : 0),
                income: formatCurrency(month.income || 0),
                expenses: formatCurrency(month.expenses || 0),
                cashFlow: formatCurrencyWithSign(month.cashFlow || 0, true),
                subtitle: `${(monthlyData[selectedMonth] || { month: 'N/A' }).month} ${currentYear}`,
            };
        }
    };

    const metrics = getDisplayMetrics();

    // Calculate dynamic Y-axis domains for charts
    const calculateYAxisDomain = (dataKey: string): [number, number] => {
        const values = monthlyData.map((item: any) => item[dataKey] || 0).filter(v => typeof v === 'number' && isFinite(v));
        const maxValue = values.length > 0 ? Math.max(...values) : 100;
        const normalizedMax = isFinite(maxValue) && maxValue > 0 ? maxValue : 100;
        return [0, normalizedMax];
    };

    // Calculate trend percentages based on actual data (comparing first half vs second half)
    const calculateTrendPercentage = (dataKey: string): { value: number; isPositive: boolean } => {
        const midPoint = Math.floor(monthlyData.length / 2);
        const firstHalf = monthlyData.slice(0, midPoint);
        const secondHalf = monthlyData.slice(midPoint);

        const firstHalfAvg =
            firstHalf.length > 0
                ? firstHalf.reduce((sum, m) => sum + (m[dataKey] || 0), 0) / firstHalf.length
                : 0;
        const secondHalfAvg =
            secondHalf.length > 0
                ? secondHalf.reduce((sum, m) => sum + (m[dataKey] || 0), 0) / secondHalf.length
                : 0;

        if (firstHalfAvg === 0) {
            return { value: 0, isPositive: secondHalfAvg >= 0 };
        }

        const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        const normalizedValue = isFinite(percentageChange) ? Math.abs(percentageChange) : 0;
        return { value: normalizedValue, isPositive: percentageChange >= 0 };
    };

    const incomeTrend = calculateTrendPercentage('income');
    const expensesTrend = calculateTrendPercentage('expenses');
    const cashFlowTrend = calculateTrendPercentage('cashFlow');

    const cashFlowDomain = calculateYAxisDomain('cashFlow');
    const incomeDomain = calculateYAxisDomain('income');
    const expensesDomain = calculateYAxisDomain('expenses');

    return (
        <div
            className="w-full h-screen flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Header Section */}
            <div className="bg-linear-to-r border-b shrink-0"
                style={{
                    borderColor: 'var(--border-primary)',
                    background: `linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-primary) 100%)`
                }} 
            >
                <div className="p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1
                                className="text-4xl font-black mb-2"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {t('dashboard.title')}
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {viewMode === "year" 
                                    ? `${t('dashboard.yearOverview').replace('{year}', String(currentYear))}` 
                                    : `${t('dashboard.monthView').replace('{month}', monthlyData[selectedMonth].month).replace('{year}', String(currentYear))}`}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <MySelect
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value as "month" | "year")}
                                options={[
                                    { value: "year", label: t('dashboard.yearly') },
                                    { value: "month", label: t('dashboard.monthly') },
                                ]}
                                className="min-w-fit"
                            />
                            {viewMode === "month" && (
                                <MySelect
                                    value={selectedMonth.toString()}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    options={monthlyData.map((data, idx) => ({
                                        value: idx.toString(),
                                        label: data.month,
                                    }))}
                                    className="min-w-fit"
                                />
                            )}
                            <MySelect
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                options={[
                                    { value: "personal", label: t('dashboard.personal') },
                                    { value: "business", label: t('dashboard.business') },
                                    { value: "investments", label: t('dashboard.investments') },
                                ]}
                                className="min-w-fit"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 pb-32">
                {viewMode === "year" ? (
                    // VISTA ANUAL
                    <>
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                            <MetricCard
                                title={t('dashboard.totalBalance')}
                                value={metrics.balance}
                                trend={cashFlowTrend}
                                subtitle={t('dashboard.accumulatedBalance')}
                                chart={
                                    <SimpleLineChart
                                        data={monthlyData}
                                        dataKey="cashFlow"
                                        height={120}
                                        showLegend={false}
                                        showGrid={false}
                                        showTooltip={false}
                                        yAxisDomain={cashFlowDomain}
                                    />
                                }
                            />
                            <MetricCard
                                title={viewMode === "year" ? t('dashboard.avgMonthlyIncome') : t('dashboard.monthlyIncome')}
                                value={metrics.income}
                                trend={incomeTrend}
                                subtitle={viewMode === "year" ? t('dashboard.averagePerMonth') : t('dashboard.thisMonth')}
                                chart={
                                    <SimpleLineChart
                                        data={monthlyData}
                                        dataKey="income"
                                        height={120}
                                        showLegend={false}
                                        showGrid={false}
                                        showTooltip={false}
                                        yAxisDomain={incomeDomain}
                                    />
                                }
                            />
                            <MetricCard
                                title={viewMode === "year" ? t('dashboard.avgMonthlyExpenses') : t('dashboard.monthlyExpenses')}
                                value={metrics.expenses}
                                trend={expensesTrend}
                                subtitle={viewMode === "year" ? t('dashboard.averagePerMonth') : t('dashboard.thisMonth')}
                                chart={
                                    <SimpleLineChart
                                        data={monthlyData}
                                        dataKey="expenses"
                                        height={120}
                                        showLegend={false}
                                        showGrid={false}
                                        showTooltip={false}
                                        yAxisDomain={expensesDomain}
                                    />
                                }
                            />
                            <MetricCard
                                title={t('dashboard.netCashFlow')}
                                value={metrics.cashFlow}
                                trend={cashFlowTrend}
                                subtitle={viewMode === "year" ? t('dashboard.averagePerMonth') : t('dashboard.thisMonth')}
                                chart={
                                    <SimpleLineChart
                                        data={monthlyData}
                                        dataKey="cashFlow"
                                        height={120}
                                        showLegend={false}
                                        showGrid={false}
                                        showTooltip={false}
                                        yAxisDomain={cashFlowDomain}
                                    />
                                }
                            />
                        </div>

                        {/* Main Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-10">
                            {/* Financial Overview & Cash Flow */}
                            <div
                                className="lg:col-span-2 rounded-xl p-7 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2
                                            className="text-xl font-bold"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {t('dashboard.financialOverview')}
                                        </h2>
                                        <p
                                            className="text-xs mt-1"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            {viewMode === "year" ? t('dashboard.yearToDateAnalysis') : `${t('dashboard.monthAnalysis').replace('{month}', monthlyData[selectedMonth].month).replace('{year}', String(currentYear))}`}
                                        </p>
                                    </div>
                                </div>
                                <ComposedChartComponent
                                    data={monthlyData}
                                    xAxisKey="month"
                                    bars={[
                                        {
                                            dataKey: "income",
                                            fill: 'var(--semantic-success)',
                                            name: t('dashboard.income'),
                                        },
                                        {
                                            dataKey: "expenses",
                                            fill: 'var(--semantic-error)',
                                            name: t('dashboard.expenses'),
                                        },
                                    ]}
                                    lines={[
                                        {
                                            dataKey: "cashFlow",
                                            stroke: 'var(--accent-primary)',
                                            strokeWidth: 2,
                                            name: t('dashboard.cashFlow'),
                                        },
                                    ]} 
                                    height={320}
                                />
                            </div>

                            {/* Top Expense Categories */}
                            <div
                                className="rounded-xl p-7 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <h2
                                    className="text-xl font-bold mb-8"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {t('dashboard.expenseCategories')}
                                </h2>

                                <DonutChart
                                    data={expenseCategories}
                                    colors={COLORS}
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    height={220}
                                    showLegend={false}
                                />
                                <div className="mt-6 space-y-3">
                                    {expenseCategories.map((cat, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[idx] }}
                                                ></div>
                                                <span
                                                    style={{
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <span
                                                className="font-semibold"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {cat.value}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-10">
                            {/* Account Balances */}
                            <div
                                className="rounded-xl p-7 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <h2
                                    className="text-xl font-bold mb-8"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {t('dashboard.accountBalances')}
                                </h2>
                                <StackedBarChart
                                    data={accountBalancesData}
                                    xAxisKey="month"
                                    bars={[
                                        {
                                            dataKey: "savings",
                                            fill: 'var(--accent-primary)',
                                            name: t('dashboard.savings'),
                                        },
                                        {
                                            dataKey: "other",
                                            fill: 'var(--accent-secondary)',
                                            name: t('dashboard.other'),
                                        },
                                        {
                                            dataKey: "expense",
                                            fill: 'var(--semantic-warning)',
                                            name: t('dashboard.expense'),
                                        },
                                        {
                                            dataKey: "tax",
                                            fill: 'var(--semantic-success)',
                                            name: t('dashboard.tax'),
                                        },
                                    ]}
                                    height={280}
                                />
                            </div>

                            {/* Recent Transactions */}
                            <div
                                className="lg:col-span-2 rounded-xl p-7 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <h2
                                    className="text-xl font-bold mb-6"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {t('dashboard.recentTransactions')}
                                </h2>
                                <div className="overflow-visible rounded-lg">
                                    <table className="w-full">
                                        <thead
                                            className="sticky top-0 z-10"
                                            style={{
                                                backgroundColor: 'rgba(var(--accent-primary-rgb), 0.06)',
                                                borderBottom: `1px solid var(--border-primary)`,
                                            }}
                                        >
                                            <tr>
                                                <th
                                                    className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider"
                                                    style={{
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    Date
                                                </th>
                                                <th
                                                    className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider"
                                                    style={{
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    Category
                                                </th>
                                                <th
                                                    className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider"
                                                    style={{
                                                        color: 'var(--text-secondary)',
                                                    }}
                                                >
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentTransactions.map((transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className="hover:bg-opacity-50 transition-colors"
                                                    style={{
                                                        borderBottom: `1px solid var(--border-secondary)`,
                                                    }}
                                                >
                                                    <td
                                                        className="py-4 px-4 text-sm font-medium"
                                                        style={{
                                                            color: 'var(--text-secondary)',
                                                        }}
                                                    >
                                                        {transaction.date}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="p-2 rounded-lg"
                                                                style={{
                                                                    backgroundColor: 'rgba(var(--accent-primary-rgb), 0.125)'
                                                                }} 
                                                            >
                                                                <TransactionIcon 
                                                                    icon={transaction.icon}
                                                                    size={16}
                                                                    className="text-current"
                                                                />
                                                            </div>
                                                            <span
                                                                style={{
                                                                    color: 'var(--text-primary)',
                                                                }}
                                                                className="font-medium"
                                                            >
                                                                {transaction.category}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td
                                                        className="py-4 px-4 text-sm font-bold text-right"
                                                        style={{
                                                            color: transaction.type === "income"
                                                                ? 'var(--semantic-success)'
                                                                : 'var(--semantic-error)',
                                                        }}
                                                    >
                                                        {transaction.type === "income" 
                                                            ? "+" + formatCurrency(transaction.rawAmount)
                                                            : "-" + formatCurrency(transaction.rawAmount)
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Budget vs Actual */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                            <div
                                className="rounded-xl p-7 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <h2
                                    className="text-xl font-bold mb-8"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Budget vs. Actual
                                </h2>
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <span
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                Budget Allocation
                                            </span>
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                65%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            label=""
                                            value={65000}
                                            max={100000}
                                            color={'var(--semantic-success)'}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <span
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                Actual Spending
                                            </span>
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                50%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            label=""
                                            value={40000}
                                            max={80000}
                                            color={'var(--accent-primary)'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Financial Goals */}
                            <div
                                className="rounded-xl p-7 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <h2
                                    className="text-xl font-bold mb-8"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Financial Goals
                                </h2>
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between mb-3">
                                            <span
                                                className="text-sm font-semibold"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                Savings Target
                                            </span>
                                            <span
                                                className="text-sm font-bold"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                265 / 1000
                                            </span>
                                        </div>
                                        <ProgressBar
                                            label=""
                                            value={265}
                                            max={1000}
                                            color={'var(--accent-primary)'}
                                        />
                                    </div>
                                    <div
                                        className="p-4 rounded-lg"
                                        style={{
                                            backgroundColor: 'rgba(var(--semantic-success-rgb), 0.06)',
                                            border: `1px solid rgba(var(--semantic-success-rgb), 0.19)`
                                        }} 
                                    >
                                        <p
                                            className="text-sm"
                                            style={{ color: 'var(--semantic-success)' }}
                                        >
                                            ✓ You're on track to meet your savings goal!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // VISTA MENSUAL
                    <>
                        {/* Monthly Metrics - 2 wide columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                            <MetricCard
                                title={t('dashboard.monthlyIncome')}
                                value={metrics.income}
                                trend={incomeTrend}
                                subtitle={t('dashboard.thisMonth')}
                                chart={
                                    <SimpleLineChart
                                        data={monthlyData}
                                        dataKey="income"
                                        height={100}
                                        showLegend={false}
                                        showGrid={false}
                                        showTooltip={false}
                                        yAxisDomain={incomeDomain}
                                    />
                                }
                            />
                            <MetricCard
                                title={t('dashboard.monthlyExpenses')}
                                value={metrics.expenses}
                                trend={expensesTrend}
                                subtitle={t('dashboard.thisMonth')}
                                chart={
                                    <SimpleLineChart
                                        data={monthlyData}
                                        dataKey="expenses"
                                        height={100}
                                        showLegend={false}
                                        showGrid={false}
                                        showTooltip={false}
                                        yAxisDomain={expensesDomain}
                                    />
                                }
                            />
                        </div>

                        {/* Monthly Summary and Recent Transactions - Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-10">
                            {/* Monthly Overview */}
                            <div className="rounded-xl p-5 sm:p-7 shadow-md transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <div className="mb-6">
                                    <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {monthlyData[selectedMonth].month} {currentYear} Summary
                                    </h2>
                                    <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                        Financial breakdown
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 mb-6">
                                    <div
                                        className="p-3 sm:p-4 rounded-lg"
                                        style={{
                                            backgroundColor: 'rgba(var(--semantic-success-rgb), 0.06)',
                                            border: `1px solid rgba(var(--semantic-success-rgb), 0.19)`
                                        }}
                                    >
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.income')}</p>
                                        <p className="text-lg sm:text-2xl font-bold mt-1" style={{ color: 'var(--semantic-success)' }}>
                                            {formatCurrency(monthlyData[selectedMonth].income)}
                                        </p>
                                    </div>
                                    <div
                                        className="p-3 sm:p-4 rounded-lg"
                                        style={{
                                            backgroundColor: 'rgba(var(--semantic-error-rgb), 0.06)',
                                            border: `1px solid rgba(var(--semantic-error-rgb), 0.19)`
                                        }}
                                    >
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.expenses')}</p>
                                        <p className="text-lg sm:text-2xl font-bold mt-1" style={{ color: 'var(--semantic-error)' }}>
                                            {formatCurrency(monthlyData[selectedMonth].expenses)}
                                        </p>
                                    </div> 
                                    <div
                                        className="p-3 sm:p-4 rounded-lg"
                                        style={{
                                            backgroundColor: 'rgba(var(--accent-primary-rgb), 0.06)',
                                            border: `1px solid rgba(var(--accent-primary-rgb), 0.19)`
                                        }}
                                    >
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.netCashFlow')}</p>
                                        <p className="text-lg sm:text-2xl font-bold mt-1" style={{ color: 'var(--accent-primary)' }}>
                                            {formatCurrencyWithSign(monthlyData[selectedMonth].cashFlow, true)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm sm:text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                                        {t('dashboard.expenseCategories')}
                                    </h3>
                                    <DonutChart
                                        data={expenseCategories}
                                        colors={COLORS}
                                        innerRadius={35}
                                        outerRadius={60}
                                        paddingAngle={2}
                                        height={160}
                                        showLegend={false}
                                    />
                                    <div className="mt-4 space-y-2">
                                        {expenseCategories.map((cat, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: COLORS[idx] }}
                                                    ></div>
                                                    <span style={{ color: 'var(--text-secondary)' }}>
                                                        {cat.name}
                                                    </span>
                                                </div>
                                                <span style={{ color: 'var(--text-primary)' }} className="font-semibold">
                                                    {cat.value}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div
                                className="rounded-xl p-5 sm:p-7 shadow-md transition-all hover:shadow-lg flex flex-col"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: `1.5px solid var(--border-primary)`,
                                }}
                            >
                                <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                                    {t('dashboard.recentTransactions')}
                                </h2>
                                <div className="overflow-x-auto flex-1 rounded-lg">
                                    <table className="w-full min-w-max">
                                        <thead
                                            className="sticky top-0 z-10"
                                            style={{
                                                backgroundColor: 'rgba(var(--accent-primary-rgb), 0.06)',
                                                borderBottom: `1px solid var(--border-primary)`,
                                            }}
                                        >
                                            <tr>
                                                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                    Date
                                                </th>
                                                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                    Category
                                                </th>
                                                <th className="text-right py-3 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentTransactions.map((transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className="hover:bg-opacity-50 transition-colors"
                                                    style={{ borderBottom: `1px solid var(--border-secondary)` }} 
                                                >
                                                    <td className="py-3 px-3 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                        {transaction.date}
                                                    </td>
                                                    <td className="py-3 px-3 text-xs sm:text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.125)' }} className="p-1.5 rounded-lg">
                                                                <TransactionIcon icon={transaction.icon} size={14} className="text-current" />
                                                            </div>
                                                            <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                                                                {transaction.category}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-xs sm:text-sm font-bold text-right" style={{
                                                        color: transaction.type === "income" ? 'var(--semantic-success)' : 'var(--semantic-error)',
                                                    }}>
                                                        {transaction.type === "income" 
                                                            ? "+" + formatCurrency(transaction.rawAmount)
                                                            : "-" + formatCurrency(transaction.rawAmount)
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinancialDashboard;
