import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Card } from "@/schemas/tableSchema";
import { useFormHandler } from "@/hooks/useFormHandler";
import { MySelect } from "./MySelect";
import { MyDatePicker } from "./MyDatePicker";
import { MyCurrencyInput } from "./MyCurrencyInput";
import { MyInput } from "./MyInput";
import { translate, getCurrentLanguage, type Language } from "@/i18n";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Partial<Card>) => void;
  isLoading?: boolean;
  initialData?: Card | null;
}

export const CardModal = ({ isOpen, onClose, onSubmit, isLoading = false, initialData = null }: CardModalProps) => {
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  const initialFormData = { type: "debit" as "credit" | "debit", name: "", last_four: "", bank: "", credit_limit: "", expiry_date: "", is_active: "true" };

  const { formData, handleChange, handleSubmit, resetForm, setFormData } = useFormHandler({
    initialValues: initialFormData,
    onSubmit: async (data) => {
      onSubmit({
        type: data.type,
        name: data.name,
        last_four: data.last_four,
        bank: data.bank,
        credit_limit: data.type === "credit" && data.credit_limit ? parseFloat(data.credit_limit) : null,
        expiry_date: data.expiry_date,
        is_active: data.is_active === "true",
      } as any);
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ type: initialData.type, name: initialData.name, last_four: initialData.last_four, bank: initialData.bank, credit_limit: initialData.credit_limit != null ? String(initialData.credit_limit) : "", expiry_date: initialData.expiry_date, is_active: String(initialData.is_active) });
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const existingDebt = initialData?.current_balance ?? 0;
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 md:mx-0 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-primary) p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-(--text-primary) tracking-tight uppercase">
              {initialData ? t('cards.modalEditCard') : t('cards.modalNewCard')}
            </h2>
            <button onClick={() => { resetForm(); onClose(); }} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors group">
              <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MySelect label={t('cards.labelType')} name="type" value={formData.type} onChange={handleChange}
              options={[{ value: "debit", label: t('cards.typeDebit') }, { value: "credit", label: t('cards.typeCredit') }]} required />

            <MySelect label={t('cards.labelStatus')} name="is_active" value={formData.is_active} onChange={handleChange}
              options={[{ value: "true", label: t('cards.statusActive') }, { value: "false", label: t('cards.statusInactive') }]} required />

            <MyInput label={t('cards.labelName')} name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Main Visa" required />
            <MyInput label={t('cards.labelBank')} name="bank" value={formData.bank} onChange={handleChange} placeholder="e.g., Chase" required />

            <MyInput label={t('cards.labelLastFour')} name="last_four" value={formData.last_four}
              onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 4); handleChange({ ...e, target: { ...e.target, name: 'last_four', value: val } }); }}
              placeholder="1234" maxLength={4} required />

            <MyDatePicker label={t('cards.labelExpiry')} name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />

            {formData.type === "credit" && (
              <div className="md:col-span-2">
                <MyCurrencyInput label={t('cards.labelLimit')} name="credit_limit" value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })} />
                {initialData && existingDebt > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--semantic-warning)' }}>
                    {t('cards.debtWarning').replace('${amount}', fmt(existingDebt))}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 col-span-1 md:col-span-2">
              <button type="button" onClick={() => { resetForm(); onClose(); }}
                className="flex-1 px-4 py-3 bg-(--bg-surface) border-2 border-(--text-secondary) text-(--text-primary) rounded-lg hover:border-(--text-primary) transition-all font-bold uppercase tracking-wider text-sm">
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 px-4 py-3 bg-(--accent-primary) text-(--text-inverted) rounded-lg hover:bg-(--accent-hover) transition-all font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 hover:-translate-y-0.5 text-sm">
                {isLoading ? t('common.saving') : (initialData ? t('cards.updateCard') : t('cards.createCard'))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
