import { useState, useEffect, useCallback } from "react";
import { X, Plus, Pencil, Trash2, RotateCw, Calculator } from "lucide-react";
import type { Card, CardPurchase } from "@/schemas/tableSchema";
import { CardPurchasePaginatedResponseSchema } from "@/schemas/tableSchema";
import { getCardPurchases, createCardPurchase, updateCardPurchase, deleteCardPurchase, advanceInstallment } from "@/services/cardPurchaseServices";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useFormHandler } from "@/hooks/useFormHandler";
import { MyInput } from "./MyInput";
import { MyDatePicker } from "./MyDatePicker";
import { MyCurrencyInput } from "./MyCurrencyInput";
import { translate, getCurrentLanguage, type Language } from "@/i18n";
import { toast } from "sonner";
import { calculateInstallment, formatMoney, money } from "@/utils/cardFinance";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  onBalanceChange?: () => void;
}

const numberFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmt(n: string | number) {
  return numberFormatter.format(n);
}

export const CardPurchasesModal = ({ isOpen, onClose, card, onBalanceChange }: Props) => {
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  const [purchases, setPurchases] = useState<CardPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CardPurchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const initial = { description: "", total_amount: "", installments: "1", interest_rate: "0", purchase_date: new Date().toISOString().split("T")[0], category: "", current_installment: "1" };
  const { formData, handleChange, handleSubmit, resetForm, setFormData } = useFormHandler({
    initialValues: initial,
    onSubmit: async (data) => {
      setIsSubmitting(true);
      try {
        const payload = { description: data.description, total_amount: data.total_amount || "0", installments: Number.parseInt(data.installments, 10) || 1, interest_rate: data.interest_rate || "0", purchase_date: data.purchase_date, category: data.category || null, current_installment: Number.parseInt(data.current_installment, 10) || 1 };
        const result = editingPurchase?.uuid ? await updateCardPurchase(card.uuid, editingPurchase.uuid, payload) : await createCardPurchase(card.uuid, payload);
        if (result.response) {
          toast.success(editingPurchase ? t('purchases.updated') : t('purchases.created'));
          resetForm(); setShowForm(false); setEditingPurchase(null);
          loadPurchases(); onBalanceChange?.();
        } else {
          toast.error(result.message || t('purchases.errorCreate'));
        }
      } catch (err: any) {
        toast.error(err?.message || t('common.unexpectedError'));
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const total = formData.total_amount || "0";
    const inst = Number.parseInt(formData.installments, 10) || 1;
    const rate = formData.interest_rate || "0";
    setPreview(Number(total) > 0 ? calculateInstallment(total, inst, rate).toFixed(2) : null);
  }, [formData.total_amount, formData.installments, formData.interest_rate]);

  const loadPurchases = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const result = await getCardPurchases(card.uuid, { page });
      const validated = CardPurchasePaginatedResponseSchema.parse(result);
      if (validated.response) { setPurchases(validated.data.data); setTotalPages(validated.data.last_page); }
    } catch (err: any) { toast.error(err?.message || translate('purchases.errorLoad', getCurrentLanguage())); }
    finally { setLoading(false); }
  }, [card.uuid, currentPage]);

  useEffect(() => {
    if (isOpen) loadPurchases(1);
    else { setShowForm(false); setEditingPurchase(null); resetForm(); }
  }, [isOpen, card.uuid, loadPurchases, resetForm]);

  const handleEdit = (p: CardPurchase) => {
    setEditingPurchase(p);
    setFormData({ description: p.description, total_amount: String(p.total_amount), installments: String(p.installments), interest_rate: String(p.interest_rate), purchase_date: p.purchase_date, category: p.category || "", current_installment: String(p.current_installment) });
    setShowForm(true);
  };

  const handleDelete = async (uuid: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteCardPurchase(card.uuid, uuid);
      if (result.response) { toast.success(t('purchases.deleted')); loadPurchases(); onBalanceChange?.(); }
      else toast.error(result.message || t('common.unexpectedError'));
    } catch (err: any) { toast.error(err?.message || t('common.unexpectedError')); }
    finally { setPurchaseToDelete(null); setIsDeleting(false); }
  };

  const handleAdvance = async (p: CardPurchase) => {
    const result = await advanceInstallment(card.uuid, p.uuid);
    if (result.response) {
      toast.success(t('purchases.installmentAdvanced').replace('{n}', String(p.current_installment + 1)).replace('{total}', String(p.installments)));
      loadPurchases(); onBalanceChange?.();
    } else toast.error(result.message || t('common.unexpectedError'));
  };

  const activePurchases = purchases.filter(p => p.current_installment <= p.installments);
  const totalMonthly = activePurchases.reduce((s, p) => s.plus(money(p.installment_amount)), money(0));
  const totalDebt = activePurchases.reduce((s, p) => s.plus(money(p.installment_amount).times(Math.max(0, p.installments - p.current_installment + 1))), money(0));
  const available = card.credit_limit != null ? money(card.credit_limit).minus(totalDebt) : null;

  if (!isOpen) return null;

  return (
    <>
      <button type="button" aria-label={t('common.close')} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col duration-300">
        <div className="bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-primary) flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-(--border-primary) shrink-0">
            <div>
              <h2 className="text-xl font-black text-(--text-primary) uppercase tracking-tight">{card.name} •••• {card.last_four}</h2>
              <p className="text-xs text-(--text-tertiary) uppercase font-bold tracking-widest">{card.bank} · {t('cards.typeCredit')}</p>
            </div>
            <button onClick={onClose} aria-label={t('common.close')} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors group">
              <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-3 divide-x divide-(--border-primary) border-b border-(--border-primary) shrink-0">
            {[{ label: t('purchases.monthlyDue'), value: `$${formatMoney(totalMonthly)}`, color: 'var(--accent-primary)' },
              { label: t('purchases.totalDebt'), value: `$${formatMoney(totalDebt)}`, color: 'var(--text-primary)' },
              { label: t('purchases.available'), value: available != null ? `$${formatMoney(available)}` : '—', color: available != null && !available.isNegative() ? 'var(--semantic-success)' : 'var(--semantic-error)' }
            ].map(({ label, value, color }) => (
              <div key={`purchase-metric-${label}`} className="p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-tertiary)">{label}</p>
                <p className="font-black text-lg" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!showForm && (
              <button onClick={() => { setEditingPurchase(null); resetForm(); setShowForm(true); }}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider shadow bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:-translate-y-0.5 transition-colors transition-transform mb-4">
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                {t('purchases.addPurchase')}
              </button>
            )}

            {showForm && (
              <div className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-sm font-black uppercase tracking-wider text-(--text-primary) mb-4">
                  {editingPurchase ? t('purchases.editPurchase') : t('purchases.newPurchase')}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <MyInput label={t('purchases.labelDescription')} name="description" value={formData.description} onChange={handleChange} placeholder="e.g., TV Samsung 55" required />
                  </div>
                  <MyCurrencyInput label={t('purchases.labelTotalAmount')} name="total_amount" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })} required />
                  <MyDatePicker 
                    label={t('purchases.labelPurchaseDate')} 
                    name="purchase_date" 
                    value={formData.purchase_date} 
                    onChange={(e) => handleChange({ target: { name: 'purchase_date', value: e.target.value } })} 
                    required 
                  />
                  <MyInput label={t('purchases.labelInstallments')} name="installments" type="number" min="1" max="120" value={formData.installments} onChange={handleChange} required />
                  <MyInput label={t('purchases.labelRate')} name="interest_rate" type="number" min="0" step="0.01" value={formData.interest_rate} onChange={handleChange} />
                  {editingPurchase && <MyInput label={t('purchases.labelCurrentInstallment')} name="current_installment" type="number" min="1" max={formData.installments} value={formData.current_installment} onChange={handleChange} />}
                  <MyInput label={t('purchases.labelCategory')} name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Electronics" className={editingPurchase ? "" : "sm:col-span-1"} />

                  {preview !== null && (
                    <div className="sm:col-span-2 flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--accent-primary-rgb),0.06)', border: '1px solid rgba(var(--accent-primary-rgb),0.2)' }}>
                      <Calculator size={16} style={{ color: 'var(--accent-primary)' }} />
                      <span className="text-xs text-(--text-secondary)">{t('purchases.monthlyPayment')}:</span>
                      <span className="font-black" style={{ color: 'var(--accent-primary)' }}>${fmt(preview)}</span>
                       <span className="text-xs text-(--text-secondary)">× {formData.installments} = ${formatMoney(money(preview).times(Number(formData.installments || '1')))}</span>
                    </div>
                  )}

                  <div className="sm:col-span-2 flex gap-2 pt-1">
                    <button type="button" onClick={() => { setShowForm(false); setEditingPurchase(null); resetForm(); }}
                      className="flex-1 px-3 py-2 border-2 border-(--text-secondary) text-(--text-primary) rounded-lg font-bold uppercase text-xs tracking-wider hover:border-(--text-primary) transition-colors">
                      {t('purchases.cancel')}
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="flex-1 px-3 py-2 bg-(--accent-primary) text-(--text-inverted) rounded-lg font-bold uppercase text-xs tracking-wider disabled:opacity-50 hover:-translate-y-0.5 transition-transform">
                      {isSubmitting ? t('purchases.saving') : (editingPurchase ? t('purchases.update') : t('purchases.create'))}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-10 text-(--text-secondary) text-sm">{t('purchases.noPurchases')}</div>
            ) : (
              <div className="space-y-2">
                {purchases.map((p) => {
                  const done = p.current_installment > p.installments;
                  const pct = Math.min(Math.round((p.current_installment - 1) / p.installments * 100), 100);
                  return (
                    <div key={p.uuid} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-bold text-sm text-(--text-primary) truncate">{p.description}</p>
                          <span className="font-black text-sm shrink-0" style={{ color: done ? 'var(--semantic-success)' : 'var(--accent-primary)' }}>
                            {done ? t('purchases.paidOff') : `$${fmt(p.installment_amount)}/mo`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: done ? 'var(--semantic-success)' : 'var(--accent-primary)' }} />
                          </div>
                          <span className="text-xs text-(--text-tertiary) shrink-0">{p.current_installment}/{p.installments} · {p.interest_rate}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!done && (
                          <button onClick={() => handleAdvance(p)} title={t('purchases.advanceTitle')}
                            className="p-1.5 rounded-lg text-(--text-secondary) hover:text-(--semantic-success) hover:bg-[rgba(52,168,83,0.1)] transition-colors">
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleEdit(p)} title={t('common.edit')}
                          className="p-1.5 rounded-lg text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover) transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setPurchaseToDelete(p.uuid)} title={t('common.delete')}
                          className="p-1.5 rounded-lg text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)] transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); loadPurchases(currentPage - 1); }}
                      aria-label="Previous page"
                      className="px-3 py-1 text-xs rounded-lg border border-(--border-primary) disabled:opacity-40 hover:bg-(--bg-hover) transition-colors">‹</button>
                    <span className="text-xs text-(--text-secondary) px-2 py-1">{currentPage}/{totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(p => p + 1); loadPurchases(currentPage + 1); }}
                      aria-label="Next page"
                      className="px-3 py-1 text-xs rounded-lg border border-(--border-primary) disabled:opacity-40 hover:bg-(--bg-hover) transition-colors">›</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal isOpen={purchaseToDelete !== null} onClose={() => setPurchaseToDelete(null)}
        onConfirm={() => purchaseToDelete && handleDelete(purchaseToDelete)} isLoading={isDeleting} />
    </>
  );
};
