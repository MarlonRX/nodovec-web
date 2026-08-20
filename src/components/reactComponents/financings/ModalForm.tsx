import { Calculator, Landmark, CreditCard, X, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MyDatePicker } from "@/components/UIComponents/MyDatePicker";
import { MyInput } from "@/components/UIComponents/MyInput";
import { MySelect } from "@/components/UIComponents/MySelect";
import { MyTextArea } from "@/components/UIComponents/MyTextArea";
import { MyCurrencyInput } from "@/components/UIComponents/MyCurrencyInput";
import { MySwitch } from "@/components/UIComponents/MySwitch";
import { formatMoney } from "@/utils/cardFinance";
import type { Language } from "@/i18n";
import type { FinancingInput } from "@/services/financingServices";
import type { Financing } from "@/types/financingInterfaces";
import dayjs from "dayjs";
import { FinancingTip } from "./FinancingTip";

type ScheduleRow = { installment_number: number; due_date: string; principal_amount: string; interest_amount: string; total_amount: string; remaining_principal: string };
type Summary = { installment_amount: string; total_interest: string; total_amount: string };

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editingFinancing: Financing | null;
  form: FinancingInput;
  update: <K extends keyof FinancingInput>(key: K, value: FinancingInput[K]) => void;
  paymentDate: string;
  setPaymentDate: (date: string) => void;
  schedule: ScheduleRow[];
  summary: Summary | null;
  saving: boolean;
  loadingInstallments: boolean;
  lang: Language;
  t: (key: string) => string;
}

export const ModalForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingFinancing,
  form,
  update,
  paymentDate,
  setPaymentDate,
  schedule,
  summary,
  saving,
  loadingInstallments,
  t,
}: ModalFormProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-(--bg-surface) h-screen overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-(--border-primary) shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.15)' }}>
                        <Calculator size={24} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl md:text-2xl font-black text-(--text-primary) tracking-tight uppercase truncate">{editingFinancing ? t("financing.editPlan") : t("financing.newPlan")}</h2>
                        <p className="text-xs uppercase font-bold tracking-wider text-(--text-tertiary) truncate">{editingFinancing ? editingFinancing.name : t("financing.subtitle")}</p>
                    </div>
                </div>
                <button type="button" onClick={onClose}
                    aria-label={t('common.close')}
                    className="p-2 rounded-lg transition-colors hover:bg-(--bg-hover) group shrink-0">
                    <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 md:p-10 overflow-hidden">
                <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,420px)] h-full">

                    {/* Form Column */}
                    <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">

                        <div className="grid gap-3 sm:grid-cols-2 flex-1 overflow-y-auto pr-3">
                            <div className="sm:col-span-2">
                                <MyInput
                                    label={t("financing.name")}
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    required
                                />
                            </div>

                            {/* Visual Type Selector */}
                            <div className="sm:col-span-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-(--text-tertiary) block mb-2">{t("financing.type")}</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => update("type", "loan")}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                        style={{
                                            border: `2px solid ${form.type === "loan" ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                                            backgroundColor: form.type === "loan" ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--bg-secondary)',
                                            color: form.type === "loan" ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        }}>
                                        <Landmark className="w-4 h-4" />
                                        {t("financing.loan")}
                                    </button>
                                    <button type="button" onClick={() => update("type", "card_purchase")}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                        style={{
                                            border: `2px solid ${form.type === "card_purchase" ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                                            backgroundColor: form.type === "card_purchase" ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--bg-secondary)',
                                            color: form.type === "card_purchase" ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        }}>
                                        <CreditCard className="w-4 h-4" />
                                        {t("financing.cardPurchase")}
                                    </button>
                                </div>
                            </div>

                            {/* Auto Transactions Switch */}
                            <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-lg" style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <Zap className="w-5 h-5 shrink-0" style={{ color: form.generate_transactions ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                                    <div className="min-w-0">
                                        <span className="text-sm font-bold text-(--text-primary) truncate">{t("financing.autoTransactions")}</span>
                                        <span className="text-[11px] text-(--text-tertiary) truncate m-1">{t("financing.autoTransactionsHint")}</span>
                                    </div>
                                </div>
                                <MySwitch
                                    checked={Boolean(form.generate_transactions)}
                                    onCheckedChange={(v) => update("generate_transactions", v)}
                                    label={t("financing.autoTransactions")}
                                />
                            </div>

                            {/* Amount, Rate, Installments in same row */}
                            <div className="sm:col-span-2 grid grid-cols-4 gap-3">
                                <MyCurrencyInput
                                    label={t("financing.amount")}
                                    value={form.principal_amount}
                                    onChange={(e) => update("principal_amount", e.target.value)}
                                    required
                                />
                                <MyInput
                                    label={t("financing.rate")}
                                    labelEnd={<FinancingTip text={t("financing.tipRate")} />}
                                    inputMode="decimal"
                                    min="0"
                                    step="0.01"
                                    value={form.annual_interest_rate}
                                    onChange={(e) => update("annual_interest_rate", e.target.value)}
                                />
                                <MyInput
                                    label={t("financing.installments")}
                                    labelEnd={<FinancingTip text={t("financing.tipInstallments")} />}
                                    type="number"
                                    min="1"
                                    max="600"
                                    value={form.installments}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        update("installments", val ? Number(val) : 1);
                                    }}
                                />
                                <MyInput
                                    label={t("financing.currentInstallment")}
                                    labelEnd={<FinancingTip text={t("financing.tipInstallments")} />}
                                    type="number"
                                    min="1"
                                    max={form.installments}
                                    value={form.current_installment ?? 1}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        update("current_installment", val ? Number(val) : 1);
                                    }}
                                />
                            </div>

                            <MySelect
                                label={t("financing.method")}
                                value={form.calculation_method}
                                onChange={(e) => update("calculation_method", e.target.value as FinancingInput["calculation_method"])}
                                options={[
                                    { value: "french", label: t("financing.french") },
                                    { value: "simple", label: t("financing.simple") },
                                    { value: "fixed_principal", label: t("financing.fixedPrincipal") },
                                ]}
                            />
                            <MySelect
                                label={t("financing.frequency")}
                                labelEnd={<FinancingTip text={t("financing.tipFrequency")} />}
                                value={form.payment_frequency}
                                onChange={(e) => update("payment_frequency", e.target.value as FinancingInput["payment_frequency"])}
                                options={[
                                    { value: "monthly", label: t("financing.monthly") },
                                    { value: "biweekly", label: t("financing.biweekly") },
                                    { value: "weekly", label: t("financing.weekly") },
                                ]}
                            />

                            <div className="sm:col-span-2">
                                <MyDatePicker
                                    label={t("financing.firstPayment")}
                                    name="first_payment_date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    placeholder={t("financing.selectDate")}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <MyTextArea
                                    label={t("financing.observations")}
                                    rows={2}
                                    value={form.observations || ""}
                                    onChange={(e) => update("observations", e.target.value)}
                                />
                            </div>
                        </div>
                    </form>

                    {/* Table Column */}
                    <div className="flex flex-col h-full overflow-hidden rounded-xl" style={{ border: '1px solid var(--border-primary)' }}>
                        {/* Table Header */}
                        <div className="p-5 shrink-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.15)' }}>
                                    <Landmark size={20} style={{ color: 'var(--accent-primary)' }} />
                                </div>
                                <h3 className="text-base font-black text-(--text-primary) uppercase tracking-wider">{t("financing.schedule")}</h3>
                            </div>
                            {summary ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {[[t("financing.installmentValue"), summary.installment_amount], [t("financing.totalInterest"), summary.total_interest], [t("financing.totalToPay"), summary.total_amount]].map(([label, value]) => (
                                        <div key={label} className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-primary)' }}>
                                            <p className="text-[9px] font-bold uppercase tracking-wider text-(--text-tertiary)">{label}</p>
                                            <p className="mt-0.5 text-sm font-black text-(--text-primary)">${formatMoney(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t("financing.emptySchedule")}</p>
                            )}
                        </div>

                        {/* Scrollable Table */}
                        <div className="flex-1 overflow-y-auto">
                            {loadingInstallments ? (
                                <div className="p-10 text-center">
                                    <div className="w-8 h-8 border-2 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t("financing.loading")}</p>
                                </div>
                            ) : schedule.length > 0 ? (
                                <>
                                    <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                                        <caption className="sr-only">{t("financing.schedule")}</caption>
                                        <colgroup>
                                            <col className="w-9" />
                                            <col className="w-auto" />
                                            <col className="w-18" />
                                            <col className="w-18" />
                                            <col className="w-20" />
                                        </colgroup>
                                        <thead className="sticky top-0 text-[10px] uppercase tracking-wider text-(--text-tertiary)" style={{ backgroundColor: 'var(--bg-surface)' }}>
                                            <tr>
                                                <th className="px-3 py-2.5 font-bold text-left">#</th>
                                                <th className="px-3 py-2.5 font-bold text-left">{t("financing.dueDate")}</th>
                                                <th className="px-3 py-2.5 font-bold text-right">{t("financing.capital")}</th>
                                                <th className="px-3 py-2.5 font-bold text-right">{t("financing.interest")}</th>
                                                <th className="px-3 py-2.5 font-bold text-right">{t("financing.total")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.map((row) => (
                                                <tr key={row.installment_number} className="border-t transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
                                                    <td className="px-3 py-2 font-bold text-(--text-primary) text-xs">{row.installment_number}</td>
                                                    <td className="px-3 py-2 text-(--text-secondary) font-mono text-xs">{dayjs(row.due_date).format('YYYY-MM-DD')}</td>
                                                    <td className="px-3 py-2 text-right text-(--text-secondary) text-xs">${formatMoney(row.principal_amount)}</td>
                                                    <td className="px-3 py-2 text-right text-xs" style={{ color: 'var(--accent-primary)' }}>${formatMoney(row.interest_amount)}</td>
                                                    <td className="px-3 py-2 text-right font-black text-(--text-primary) text-xs">${formatMoney(row.total_amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <div className="p-10 text-center">
                                    <Landmark className="mx-auto mb-3 opacity-30" size={28} style={{ color: 'var(--text-secondary)' }} />
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t("financing.noRows")}</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons Below Table */}
                        <div className="p-4 shrink-0 border-t" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                            <div className="flex gap-3">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button onClick={onSubmit} disabled={saving}
                                                className="flex-1 rounded-lg px-4 py-3 font-black transition-transform disabled:opacity-40 hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                                style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverted)' }}>
                                                {saving ? t("financing.saving") : (editingFinancing ? t("financing.update") : t("financing.save"))}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-55 text-xs">{t("financing.tipSave")}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </>
  );
};
