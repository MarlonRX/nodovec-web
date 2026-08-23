import { useState, useEffect, useCallback, useMemo } from "react";
import { Info, X } from "lucide-react";
import Decimal from "decimal.js";
import type { Transaction } from "@/schemas/tableSchema";
import { STORAGE_CONFIG } from "@/config/api";
import { useFormHandler } from "@/hooks/useFormHandler";
import { MySelect } from "./MySelect";
import { MyDatePicker } from "./MyDatePicker";
import { MyTextArea } from "./MyTextArea";
import { MyCurrencyInput } from "./MyCurrencyInput";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { translate, getCurrentLanguage, type Language } from "@/i18n";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Partial<Transaction>) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: Transaction | null;
  /** When provided, the default date is the 1st of that month and date picker is restricted to that month's range */
  defaultYear?: number;
  defaultMonth?: number;
}

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
  defaultYear,
  defaultMonth,
}: TransactionModalProps) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  // Calculate date range when defaultYear/defaultMonth are provided (from transactions table view)
  const dateRange = useMemo(() => {
    if (defaultYear != null && defaultMonth != null) {
      const monthPadded = String(defaultMonth).padStart(2, "0");
      const daysInMonth = new Date(defaultYear, defaultMonth, 0).getDate();
      return {
        min: `${defaultYear}-${monthPadded}-01`,
        max: `${defaultYear}-${monthPadded}-${daysInMonth}`,
        defaultDate: `${defaultYear}-${monthPadded}-01`,
      };
    }
    return null;
  }, [defaultYear, defaultMonth]);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  const categoryOptions = [
    { value: "salary", label: t("transactionForm.categorySalary") },
    { value: "freelance", label: t("transactionForm.categoryFreelance") },
    { value: "investment", label: t("transactionForm.categoryInvestment") },
    { value: "bonus", label: t("transactionForm.categoryBonus") },
    { value: "other_income", label: t("transactionForm.categoryOtherIncome") },
    { value: "food", label: t("transactionForm.categoryFood") },
    { value: "transportation", label: t("transactionForm.categoryTransportation") },
    { value: "utilities", label: t("transactionForm.categoryUtilities") },
    { value: "entertainment", label: t("transactionForm.categoryEntertainment") },
    { value: "healthcare", label: t("transactionForm.categoryHealthcare") },
    { value: "shopping", label: t("transactionForm.categoryShopping") },
    { value: "rent", label: t("transactionForm.categoryRent") },
    { value: "other_expense", label: t("transactionForm.categoryOtherExpense") },
  ];

  const initialFormData = {
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "food",
    date: dateRange?.defaultDate ?? new Date().toISOString().split("T")[0],
    is_paid: "paid",
    is_fixed: false,
  };

  const { formData, handleChange, handleSubmit, resetForm, setFormData } = useFormHandler({
    initialValues: initialFormData,
    onSubmit: async (data) => {
      let amountValue: Decimal;
      try {
        amountValue = new Decimal(data.amount || "0");
      } catch {
        alert(t("transactionForm.invalidAmount"));
        return;
      }

      if (amountValue.isNaN() || amountValue.lessThanOrEqualTo(0)) {
        alert(t("transactionForm.amountGreaterThanZero"));
        return;
      }

      const transactionPayload: any = {
        description: data.description,
        amount: amountValue.toNumber(),
        type: data.type,
        category: data.category,
        transaction_date: data.date,
        is_fixed: data.is_fixed,
      };

      if (initialData?.id) {
        transactionPayload.id = initialData.id;
      }

      if (isLoggedIn && userId) {
        transactionPayload.user_id = userId;
      }

      await onSubmit(transactionPayload);
    },
  });

  // Initialize form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        description: initialData.description || "",
        amount: String(initialData.amount || ""),
        type: initialData.type || "expense",
        category: String(initialData.category || "food"),
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        is_paid: (initialData as any).is_paid || "paid",
        is_fixed: Boolean((initialData as any).is_fixed),
      });
    }
  }, [initialData, isOpen, setFormData]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e as any);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      amount: e.target.value,
    }));
  };

  // Read user from localStorage on mount only
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const userKey = `${STORAGE_CONFIG.PREFIX}${STORAGE_CONFIG.USER_KEY}`;
        const userStr = localStorage.getItem(userKey);
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user.id);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error getting user from localStorage:", error);
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label={t('common.close')}
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 md:mx-0 max-h-[90vh] overflow-y-auto transition-opacity duration-300">
        <div className="bg-(--bg-surface) rounded-none shadow-2xl border border-(--border-primary) p-4 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-(--text-primary) tracking-tight">
                {initialData ? t("transactionForm.edit") : t("transactionForm.new")}
              </h2>
              {!isLoggedIn && (
                <p className="text-xs text-(--text-secondary) mt-1 font-medium italic">
                  {t("transactionForm.savingAsDraft")}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              aria-label={t('common.close')}
              className="p-2 hover:bg-(--bg-hover) rounded-none transition-colors group"
            >
              <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <TransactionFormContent
            formData={formData}
            handleChange={handleChange}
            handleTextAreaChange={handleTextAreaChange}
            handleAmountChange={handleAmountChange}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleClose={handleClose}
            isLoading={isLoading}
            initialData={initialData}
            dateRange={dateRange}
            defaultMonth={defaultMonth}
            defaultYear={defaultYear}
            categoryOptions={categoryOptions}
            t={t}
          />
        </div>
      </div>
    </>
  );
};

interface TransactionFormContentProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleClose: () => void;
  isLoading: boolean;
  initialData: Transaction | null;
  dateRange: { min: string; max: string; defaultDate: string } | null;
  defaultMonth?: number;
  defaultYear?: number;
  categoryOptions: { value: string; label: string }[];
  t: (key: string) => string;
}

const TransactionFormContent = ({
  formData,
  handleChange,
  handleTextAreaChange,
  handleAmountChange,
  setFormData,
  handleSubmit,
  handleClose,
  isLoading,
  initialData,
  dateRange,
  defaultMonth,
  defaultYear,
  categoryOptions,
  t,
}: TransactionFormContentProps) => (
  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
    <div className="col-span-1">
      <MyDatePicker
        label={t("transactionForm.date")}
        name="date"
        value={formData.date}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, date: e.target.value }))}
        required
        min={dateRange?.min}
        max={dateRange?.max}
      />
      {dateRange && (
        <p className="text-xs text-(--text-tertiary) mt-1">
          {defaultMonth && defaultYear
            ? `${String(defaultMonth).padStart(2, "0")}-${defaultYear}`
            : ""}
        </p>
      )}
    </div>

    <div className="col-span-1">
      <MySelect
        label={t("transactionForm.type")}
        name="type"
        value={formData.type}
        onChange={handleChange}
        options={[
          { value: "expense", label: t("transactionForm.typeExpense") },
          { value: "income", label: t("transactionForm.typeIncome") },
        ]}
        required
      />
    </div>

    <div className="col-span-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <MySelect
            label={t("transactionForm.paymentStatus")}
            name="is_paid"
            value={formData.is_paid}
            onChange={handleChange}
            options={[
              { value: "paid", label: t("transactionForm.statusPaid") },
              { value: "unpaid", label: t("transactionForm.statusUnpaid") },
            ]}
            required
          />
        </div>
        <div>
          <MyCurrencyInput
            label={t("transactionForm.amount")}
            name="amount"
            value={formData.amount}
            onChange={handleAmountChange}
            required
          />
        </div>
      </div>
    </div>

    <div className="col-span-1">
      <MySelect
        label={t("transactionForm.category")}
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={categoryOptions}
        required
      />
    </div>

    <div className="col-span-1 md:col-span-2">
      <div className="flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox
            checked={Boolean(formData.is_fixed)}
            onCheckedChange={(checked) =>
              setFormData((prev: any) => ({ ...prev, is_fixed: checked === true }))
            }
            aria-label={
              formData.type === "income"
                ? t("transactionForm.fixedIncome")
                : t("transactionForm.fixedExpense")
            }
          />
          <span className="text-sm font-medium text-(--text-primary)">
            {formData.type === "income"
              ? t("transactionForm.fixedIncome")
              : t("transactionForm.fixedExpense")}
          </span>
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex size-5 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:text-(--accent-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary)/50"
                aria-label={
                  formData.type === "income"
                    ? t("transactionForm.fixedIncomeTooltip")
                    : t("transactionForm.fixedExpenseTooltip")
                }
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {formData.type === "income"
                ? t("transactionForm.fixedIncomeTooltip")
                : t("transactionForm.fixedExpenseTooltip")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <div className="col-span-1 md:col-span-2">
      <MyTextArea
        label={t("transactionForm.description")}
        name="description"
        value={formData.description}
        onChange={handleTextAreaChange}
        placeholder={t("transactionForm.descriptionPlaceholder")}
        rows={3}
        required
      />
    </div>

    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 md:pt-6 col-span-1 md:col-span-2">
      <button
        type="button"
        onClick={handleClose}
        className="flex-1 px-4 py-2 md:py-3 bg-(--bg-surface) border border-(--text-secondary) text-(--text-primary) rounded-none hover:border-(--text-primary) hover:bg-(--bg-secondary) transition-colors font-semibold text-sm md:text-base"
      >
        {t("transactionForm.cancel")}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 px-4 py-2 md:py-3 bg-(--accent-primary) text-(--text-inverted) rounded-none hover:bg-(--accent-hover) transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
      >
        {isLoading
          ? (initialData ? t("transactionForm.updating") : t("transactionForm.creating"))
          : (initialData ? t("transactionForm.update") : t("transactionForm.create"))
        }
      </button>
    </div>
  </form>
);
