import { CreditCard, Landmark, Pencil, Trash2, Zap, Calendar } from "lucide-react";
import type { Financing } from "@/types/financingInterfaces";
import { formatMoney } from "@/utils/cardFinance";
import { formatRate, getNextPaymentDate } from "./financingConstants";

interface FinancingListItemProps {
  financing: Financing;
  onEdit: (f: Financing) => void;
  onDelete: (f: Financing) => void;
  t: (key: string) => string;
}

export function FinancingListItem({ financing: f, onEdit, onDelete, t }: FinancingListItemProps) {
  const nextPayment = getNextPaymentDate(f.first_payment_date, f.payment_frequency, f.current_installment);
  const isCard = f.type === "card_purchase";
  return (
    <div
      className="rounded-xl p-4 md:p-5 transition-shadow transition-transform hover:shadow-lg hover:-translate-y-0.5 cursor-default"
      style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-surface)' }}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: isCard ? 'rgba(59,130,246,0.12)' : 'rgba(var(--accent-primary-rgb), 0.12)' }}>
            {isCard
              ? <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
              : <Landmark className="w-6 h-6 md:w-7 md:h-7 text-(--accent-primary)" />
            }
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-base md:text-lg text-(--text-primary) truncate">{f.name}</h3>
            {f.generate_transactions && (
              <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                <Zap className="w-3 h-3" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("financing.autoBadge")}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: f.status === "active" ? 'rgba(var(--accent-primary-rgb), 0.15)' : 'rgba(46,139,87,0.15)',
                color: f.status === "active" ? 'var(--accent-primary)' : 'var(--semantic-success)',
              }}>
              {f.status}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary)">
              {isCard ? t("financing.cardPurchase") : t("financing.loan")}
            </span>
            {f.card && (
              <span className="text-xs font-bold text-(--text-tertiary)">
                {f.card.name} ···· {f.card.last_four}
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary) mb-0.5">{t("financing.amount")}</p>
            <p className="font-black text-lg text-(--text-primary)">${formatMoney(f.principal_amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary) mb-0.5">{t("financing.rate")}</p>
            <p className="font-black text-lg" style={{ color: 'var(--accent-primary)' }}>{formatRate(f.annual_interest_rate)}</p>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold text-(--text-primary)">
            {t("financing.installment")} {f.current_installment}/{f.installments}
          </span>
          {nextPayment && (
            <span className="flex items-center gap-1 text-xs font-bold text-(--text-tertiary)">
              <Calendar className="w-3.5 h-3.5" />
              {nextPayment}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(f); }}
            className="p-2.5 rounded-xl transition-transform hover:scale-105 group"
            aria-label={t("financing.editPlan")}
            style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.08)', color: 'var(--accent-primary)' }}>
            <Pencil className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(f); }}
            className="p-2.5 rounded-xl transition-transform hover:scale-105"
            aria-label={t("financing.delete")}
            style={{ backgroundColor: 'rgba(229, 72, 77, 0.08)', color: 'var(--semantic-error)' }}>
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex sm:hidden items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary)">{t("financing.amount")}</p>
          <p className="font-black text-base text-(--text-primary)">${formatMoney(f.principal_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary)">{t("financing.rate")}</p>
          <p className="font-black text-base" style={{ color: 'var(--accent-primary)' }}>{formatRate(f.annual_interest_rate)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary)">{t("financing.installment")}</p>
          <p className="font-black text-base text-(--text-primary)">{f.current_installment}/{f.installments}</p>
        </div>
        {nextPayment && (
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary)">{t("financing.nextPayment")}</p>
            <p className="flex items-center gap-1 font-bold text-xs text-(--text-secondary) mt-0.5">
              <Calendar className="w-3 h-3" />
              {nextPayment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
