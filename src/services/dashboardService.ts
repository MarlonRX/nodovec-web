import { authStore } from "../store/auth";
import dashboardDataJson from "../data/dashboardData.json";
import { getTransactions, getTransactionsTotals, getAllTransactionsForMonth } from "./transactionServices";
import { isDemoMode } from "@/lib/demoUtils";
import { STORAGE_CONFIG } from "../config/api";
import type { Filters } from "@/schemas/tableSchema";

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  cashFlow: number;
  [key: string]: any;
}

export interface AccountBalance {
  month: string;
  tax: number;
  expense: number;
  other: number;
  savings: number;
  [key: string]: any;
}

export interface ExpenseCategory {
  name: string;
  value: number;
}

export interface Transaction {
  id: number;
  date: string;
  rawDate: string;
  category: string;
  description: string;
  amount: string;
  icon: string;
  type: 'income' | 'expense';
  rawAmount: number;
}

export interface DashboardData {
  monthlyData: MonthlyData[];
  accountBalancesData: AccountBalance[];
  expenseCategories: ExpenseCategory[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
}

// Month name mapping
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Icon mapping for transaction categories
const CATEGORY_ICON_MAP: { [key: string]: string } = {
  salary: "briefcase",
  freelance: "briefcase",
  investment: "trending-up",
  food: "utensils",
  rent: "home",
  utilities: "zap",
  entertainment: "play",
  healthcare: "heart",
  shopping: "shopping-bag",
  groceries: "shopping-cart",
  transport: "car",
  bills: "file-text",
  default: "shopping-bag",
};

/**
 * Get icon for category (default if not found)
 */
function getIconForCategory(category: string): string {
  const icon = CATEGORY_ICON_MAP[category.toLowerCase()];
  return icon || CATEGORY_ICON_MAP.default;
}

/**
 * Format date to DD/MM/YYYY
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Process transactions into dashboard data
 */
function processTransactionsToDashboard(
  transactionsData: any
): DashboardData {
  const transactions = transactionsData?.data || [];

  // Initialize monthly data for all 12 months of current year
  const monthlyDataMap: { [key: number]: MonthlyData } = {};
  for (let i = 0; i < 12; i++) {
    monthlyDataMap[i] = {
      month: MONTH_NAMES[i],
      income: 0,
      expenses: 0,
      cashFlow: 0,
    };
  }

  // Initialize category expenses map
  const categoryExpensesMap: { [key: string]: number } = {};
  let totalExpenses = 0;

  // Process each transaction
  transactions.forEach((transaction: any) => {
    const date = new Date(transaction.date);
    const monthIndex = date.getMonth();
    const amount = parseFloat(transaction.amount) || 0;

    // Add to monthly data
    if (transaction.type === "income") {
      monthlyDataMap[monthIndex].income += amount;
    } else if (transaction.type === "expense") {
      monthlyDataMap[monthIndex].expenses += amount;
      totalExpenses += amount;

      // Track category expenses
      const category = transaction.category;
      categoryExpensesMap[category] =
        (categoryExpensesMap[category] || 0) + amount;
    }
  });

  // Calculate cashFlow for each month
  Object.values(monthlyDataMap).forEach((month) => {
    month.cashFlow = month.income - month.expenses;
  });

  // Convert monthly data map to array
  const monthlyData = Object.values(monthlyDataMap);

  // Calculate expense categories percentages
  const expenseCategories: ExpenseCategory[] = Object.entries(
    categoryExpensesMap
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5 categories
    .map(([name, value]) => ({
      name,
      value: Math.round((value / totalExpenses) * 100) || 0,
    }));

  // Map all transactions with raw date for month filtering
  const allTransactions: Transaction[] = transactions
    .slice()
    .reverse()
    .map((transaction: any, index: number) => {
      const rawAmount = parseFloat(transaction.amount) || 0;
      return {
        id: index + 1,
        date: formatDate(transaction.date),
        rawDate: transaction.date,
        category: transaction.category,
        description: transaction.description || '',
        amount: `${transaction.type === "income" ? "+" : "-"}$${Math.abs(
          rawAmount
        ).toFixed(2)}`,
        icon: getIconForCategory(transaction.category),
        type: transaction.type as 'income' | 'expense',
        rawAmount: rawAmount,
      };
    });

  // Get recent transactions (last 7 overall)
  const recentTransactions = allTransactions.slice(0, 7);

  // Use demo account balances (we don't have this data in our schema)
  const demoData = dashboardDataJson as DashboardData;
  const accountBalancesData = demoData.accountBalancesData;

  return {
    monthlyData,
    accountBalancesData,
    expenseCategories,
    recentTransactions,
    allTransactions,
  };
}

/**
 * Filter transactions by month index (0-11)
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  monthIndex: number
): Transaction[] {
  return transactions.filter((t) => {
    const date = new Date(t.rawDate);
    return date.getMonth() === monthIndex;
  });
}

/**
 * Fetches dashboard data from transactions
 * Priority:
 * 1. If in demo mode (/demo path) → use demo data from 2026
 * 2. If authenticated user → fetch real user transactions from current year
 * 3. If no transactions found → return empty dashboard (don't fallback to demo)
 * 4. On error → fallback to demo data
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Check if user is authenticated using the correct storage key
    const tokenKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.TOKEN_KEY}`;
    const hasAuthToken = typeof window !== 'undefined' && !!localStorage.getItem(tokenKey);
    
    if (!hasAuthToken) {
      console.log('[Dashboard] No auth token found, using demo data');
      return getDemoData();
    }

    const isInDemoMode = isDemoMode();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    console.log(`[Dashboard] Mode: ${isInDemoMode ? "DEMO" : "AUTHENTICATED"}`);

    // CASE 1: In demo mode - use demo data from 2026
    if (isInDemoMode) {
      console.log("[Dashboard] Using demo data from 2026");
      return getDemoData();
    }

    // CASE 2: Not in demo mode - fetch real user transactions from current year
    // Now using getAllTransactionsForMonth to get ALL transactions, not just first page
    console.log(`[Dashboard] Fetching real user transactions for year ${currentYear}`);
    const allTransactions: any[] = [];
    const monthlyTotals: { [key: number]: { income: number; expense: number; net: number } } = {};

    // Initialize totals for all months with default 0 values
    for (let i = 1; i <= 12; i++) {
      monthlyTotals[i] = { income: 0, expense: 0, net: 0 };
    }

    for (let month = 1; month <= 12; month++) {
      try {
        // Get all transactions for the month (handles pagination automatically)
        const result = await getAllTransactionsForMonth(currentYear, month);
        if (result.response && result.data && result.data.length > 0) {
          console.log(
            `[Dashboard] Month ${month}: found ${result.data.length} transactions (ALL, not just first page)`
          );
          allTransactions.push(...result.data);
        }

        // Also fetch totals separately to ensure accuracy for all records
        const totalsResult = await getTransactionsTotals({ year: currentYear, month });
        if (totalsResult.response && totalsResult.data) {
          monthlyTotals[month] = {
            income: Number(totalsResult.data.income) || 0,
            expense: Number(totalsResult.data.expense) || 0,
            net: Number(totalsResult.data.net) || 0,
          };
          console.log(
            `[Dashboard] Month ${month} totals: income=${monthlyTotals[month].income}, expense=${monthlyTotals[month].expense}, net=${monthlyTotals[month].net}`
          );
        }
      } catch (monthError) {
        console.log(`[Dashboard] Month ${month}: error or no data`);
        // Keep default 0 values for this month
        continue;
      }
    }

    console.log(`[Dashboard] Total transactions fetched: ${allTransactions.length}`);

    // CASE 3: Process real transactions if we have any
    if (allTransactions.length > 0) {
      console.log("[Dashboard] Processing real user transactions with accurate totals");
      const dashboardData = processTransactionsToDashboard({
        data: allTransactions,
      });
      
      // Override monthly data with accurate totals from API
      dashboardData.monthlyData = dashboardData.monthlyData.map((month, index) => {
        const monthNum = index + 1;
        const totals = monthlyTotals[monthNum] || { income: 0, expense: 0, net: 0 };
        return {
          ...month,
          income: Number(totals.income) || 0,
          expenses: Number(totals.expense) || 0,
          cashFlow: Number(totals.net) || 0,
        };
      });
      
      return dashboardData;
    }

    // CASE 4: No transactions found for real user - return empty dashboard
    console.log("[Dashboard] No transactions found for user, returning empty dashboard");
    return getEmptyDashboard();
  } catch (error) {
    console.error("[Dashboard] Error loading dashboard data:", error);
    // Fallback to demo data on critical error
    return getDemoData();
  }
}

/**
 * Returns demo data from JSON file
 */
function getDemoData(): DashboardData {
  const data = dashboardDataJson as DashboardData;
  // Ensure allTransactions exists for demo data (same as recent if missing)
  return {
    ...data,
    allTransactions: data.allTransactions || data.recentTransactions || [],
  };
}

/**
 * Returns empty dashboard structure with no data
 * Used when authenticated user has no transactions yet
 */
function getEmptyDashboard(): DashboardData {
  return {
    monthlyData: MONTH_NAMES.map((month) => ({
      month,
      income: 0,
      expenses: 0,
      cashFlow: 0,
    })),
    accountBalancesData: [],
    expenseCategories: [],
    recentTransactions: [],
    allTransactions: [],
  };
}
