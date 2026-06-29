import { useState, useEffect, useCallback } from "react";
import { X, Calculator } from "lucide-react";
import type { CardPurchase } from "@/schemas/tableSchema";
import { useFormHandler } from "@/hooks/useFormHandler";
import { MyInput } from "./MyInput";
import { MyDatePicker } from "./MyDatePicker";
import { MyCurrencyInput } from "./MyCurrencyInput";
import { MySelect } from "./MySelect";
import { MyTextArea } from "./MyTextArea";
import { translate, getCurrentLanguage, type Language } from "@/i18n";

interface CardPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CardPurchase>) => void;
  isLoading?: boolean;
  initialData?: CardPurchase | null;
}

function calcInstallment(total: number, installments: number, annualRate: number): number {
  if (!total || !installments) return 0;
  if (annualRate <= 0) return total / installments;
  const r = annualRate / 100 / 12;
  return total * (r * Math.pow(1 + r, installments)) / (Math.pow(1 + r, installments) - 1);
}

export const CardPurchaseModal = ({ isOpen, onClose, onSubmit, isLoading = false, initialData = null }: CardPurchaseModalProps) => {
  const [preview, setPreview] = useState<number | null>(null);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  const initial = {
    description: "",
    total_amount: "",
    installments: "1",
    interest_rate: "0",
    purchase_date: new Date().toISOString().split("T")[0],
    category: "",
    current_installment: "1",
  };

  const { formData, handleChange, handleSubmit, resetForm, setFormData } = useFormHandler({
    initialValues: initial,
    onSubmit: async (data) => {
      onSubmit({
        description: data.description,
        total_amount: parseFloat(data.total_amount) || 0,
        installments: parseInt(data.installments) || 1,
        interest_rate: parseFloat(data.interest_rate) || 0,
        purchase_date: data.purchase_date,
        category: data.category || null,
        current_installment: parseInt(data.current_installment) || 1,
      } as any);
    },
  });

  // Live installment preview
  useEffect(() => {
    const total = parseFloat(formData.total_amount) || 0;
    const inst = parseInt(formData.installments) || 1;
    const rate = parseFloat(formData.interest_rate) || 0;
    if (total > 0 && inst > 0) {
      setPreview(calcInstallment(total, inst, rate));
    } else {
      setPreview(null);
    }
  }, [formData.total_amount, formData.installments, formData.interest_rate]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          description: initialData.description,
          total_amount: String(initialData.total_amount),
          installments: String(initialData.installments),
          interest_rate: String(initialData.interest_rate),
          purchase_date: initialData.purchase_date,
          category: initialData.category || "",
          current_installment: String(initialData.current_installment),
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 md:mx-0 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-primary) p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-(--text-primary) tracking-tight uppercase">
              {initialData ? t("purchaseForm.edit") : t("purchaseForm.new")}
            </h2>
            <button onClick={() => { resetForm(); onClose(); }} className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors group">
              <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <MyInput label={t("purchaseForm.description")} name="description" value={formData.description} onChange={handleChange} placeholder={t("purchaseForm.descriptionPlaceholder")} required />
            </div>

            <div>
              <MyCurrencyInput
                label={t("purchaseForm.totalAmount")}
                name="total_amount"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                required
              />
            </div>

            <div>
              <MyDatePicker label={t("purchaseForm.purchaseDate")} name="purchase_date" value={formData.purchase_date} onChange={handleChange} required />
            </div>

            <div>
              <MyInput
                label={t("purchaseForm.installments")}
                name="installments"
                type="number"
                min="1"
                max="120"
                value={formData.installments}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <MyInput
                label={t("purchaseForm.annualRate")}
                name="interest_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.interest_rate}
                onChange={handleChange}
              />
            </div>

            {initialData && (
              <div>
                <MyInput
                  label={t("purchaseForm.currentInstallment")}
                  name="current_installment"
                  type="number"
                  min="1"
                  max={formData.installments}
                  value={formData.current_installment}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className={initialData ? "" : "md:col-span-2"}>
              <MyInput label={t("purchaseForm.categoryOptional")} name="category" value={formData.category} onChange={handleChange} placeholder={t("purchaseForm.categoryPlaceholder")} />
            </div>

            {/* Live installment preview */}
            {preview !== null && (
              <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-xl border"
                style={{ backgroundColor: 'rgba(var(--accent-primary-rgb),0.06)', borderColor: 'rgba(var(--accent-primary-rgb),0.2)' }}>
                <Calculator size={20} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{t("purchaseForm.monthlyPayment")}</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--accent-primary)' }}>
                    ${fmtCurrency(preview)}
                    <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-secondary)' }}>
                      × {formData.installments} = ${fmtCurrency(preview * parseInt(formData.installments || '1'))}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 col-span-1 md:col-span-2">
              <button type="button" onClick={() => { resetForm(); onClose(); }}
                className="flex-1 px-4 py-3 bg-(--bg-surface) border-2 border-(--text-secondary) text-(--text-primary) rounded-lg hover:border-(--text-primary) transition-all font-bold uppercase tracking-wider text-sm">
                {t("purchaseForm.cancel")}
              </button>
              <button type="submit" disabled={isLoading}
                className="flex-1 px-4 py-3 bg-(--accent-primary) text-(--text-inverted) rounded-lg hover:bg-(--accent-hover) transition-all font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 hover:-translate-y-0.5 text-sm">
                {isLoading ? (initialData ? t("purchaseForm.updating") : t("purchaseForm.creating")) : (initialData ? t("purchaseForm.update") : t("purchaseForm.create"))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
