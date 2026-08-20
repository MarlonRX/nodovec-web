import { CreditCard } from "lucide-react";
import type { CardPurchase } from "@/schemas/tableSchema";
import { formatAmount } from "./transactionsConstants";

interface CardPaymentsPanelProps {
  purchases: CardPurchase[];
  t: (key: string) => string;
}

export const CardPaymentsPanel = ({ purchases, t }: CardPaymentsPanelProps) => (
  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(var(--accent-primary-rgb),0.2)', backgroundColor: 'rgba(var(--accent-primary-rgb),0.04)' }}>
    <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(var(--accent-primary-rgb),0.15)' }}>
      <CreditCard size={16} style={{ color: 'var(--accent-primary)' }} />
      <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>{t('transactions.cardPaymentsTitle')}</span>
      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--accent-primary-rgb),0.15)', color: 'var(--accent-primary)' }}>{purchases.length} {t('transactions.cardPaymentsActive')}</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
      {purchases.map((p) => (
        <div key={p.uuid} className="flex items-center justify-between gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-primary)' }}>
          <div className="min-w-0">
            <p className="text-xs font-bold text-(--text-primary) truncate">{p.description}</p>
            <p className="text-[10px] text-(--text-tertiary)">{p.card?.name} •••• {p.card?.last_four} · {p.current_installment}/{p.installments}</p>
          </div>
          <span className="font-black text-sm shrink-0" style={{ color: 'var(--accent-primary)' }}>${formatAmount(p.installment_amount)}</span>
        </div>
      ))}
    </div>
    <div className="px-4 py-2 text-right border-t" style={{ borderColor: 'rgba(var(--accent-primary-rgb),0.15)' }}>
      <span className="text-xs text-(--text-secondary)">Total monthly: </span>
      <span className="font-black text-sm" style={{ color: 'var(--accent-primary)' }}>${formatAmount(purchases.reduce((s, p) => s + p.installment_amount, 0))}</span>
    </div>
  </div>
);
