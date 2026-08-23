import React from "react";
import { TransactionIcon } from "../TransactionIcon";
import { formatCurrency } from "../../../lib/currencyFormatter";
import { translateCategory } from "../../../lib/categoryTranslator";
import type { Transaction } from "../../../services/dashboardService";

interface RecentTransactionsProps {
  transactions: Transaction[];
  t: (key: string) => string;
  compact?: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  t,
  compact = false,
}) => (
  <div className="overflow-x-auto rounded-none -mx-2 px-2">
    <table className="w-full min-w-[320px]">
      <thead
        className="sticky top-0 z-10"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <tr>
          <th
            className={`text-left font-semibold tracking-wide ${compact ? "py-2 px-2 text-[10px]" : "py-3 sm:py-4 px-3 sm:px-4 text-xs"}`}
            style={{ color: "var(--text-secondary)" }}
          >
            {t('transactions.colDate')}
          </th>
          <th
            className={`text-left font-semibold tracking-wide ${compact ? "py-2 px-2 text-[10px]" : "py-3 sm:py-4 px-3 sm:px-4 text-xs"}`}
            style={{ color: "var(--text-secondary)" }}
          >
            {t('transactions.colCategory')}
          </th>
          <th
            className={`text-left font-semibold tracking-wide ${compact ? "py-2 px-2 text-[10px]" : "py-3 sm:py-4 px-3 sm:px-4 text-xs"}`}
            style={{ color: "var(--text-secondary)" }}
          >
            {t('transactions.colDescription')}
          </th>
          <th
            className={`text-right font-semibold tracking-wide ${compact ? "py-2 px-2 text-[10px]" : "py-3 sm:py-4 px-3 sm:px-4 text-xs"}`}
            style={{ color: "var(--text-secondary)" }}
          >
            {t('transactions.colAmount')}
          </th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr
            key={transaction.id}
            className="hover:bg-opacity-50 transition-colors"
            style={{ borderBottom: "1px solid var(--border-secondary)" }}
          >
            <td
              className={`font-medium ${compact ? "py-2 px-2 text-[11px]" : "py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm"}`}
              style={{ color: "var(--text-secondary)" }}
            >
              {transaction.date}
            </td>
            <td className={compact ? "py-2 px-2" : "py-3 sm:py-4 px-3 sm:px-4"}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="rounded-none flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(var(--accent-primary-rgb), 0.125)",
                  }}
                >
                  <div className={compact ? "p-1" : "p-1.5 sm:p-2"}>
                    <TransactionIcon
                      icon={transaction.icon}
                      size={compact ? 12 : 14}
                      className="text-current"
                    />
                  </div>
                </div>
                <span
                  className={`font-medium truncate ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}
                  style={{ color: "var(--text-primary)" }}
                >
                  {translateCategory(transaction.category, t)}
                </span>
              </div>
            </td>
            <td
              className={`${compact ? "py-2 px-2 text-[11px]" : "py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm"}`}
            >
              <span
                className="truncate block max-w-[120px] sm:max-w-[180px]"
                style={{ color: "var(--text-secondary)" }}
                title={transaction.description}
              >
                {transaction.description || "—"}
              </span>
            </td>
            <td
              className={`font-bold text-right font-financial ${compact ? "py-2 px-2 text-[11px]" : "py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm"}`}
              style={{
                color:
                  transaction.type === "income"
                    ? "var(--semantic-success)"
                    : "var(--semantic-error)",
              }}
            >
              {transaction.type === "income"
                ? "+" + formatCurrency(transaction.rawAmount)
                : "-" + formatCurrency(transaction.rawAmount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
