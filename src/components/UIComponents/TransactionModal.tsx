import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Decimal from "decimal.js";
import type { Transaction } from "@/schemas/tableSchema";
import { STORAGE_CONFIG } from "@/config/api";
import { useFormHandler } from "@/hooks/useFormHandler";
import { MySelect } from "./MySelect";
import { MyDatePicker } from "./MyDatePicker";
import { MyTextArea } from "./MyTextArea";
import { MyCurrencyInput } from "./MyCurrencyInput";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Partial<Transaction>) => void;
  isLoading?: boolean;
  initialData?: Transaction | null;
}

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}: TransactionModalProps) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const categoryOptions = [
    { value: "salary", label: "Salary" },
    { value: "freelance", label: "Freelance" },
    { value: "investment", label: "Investment" },
    { value: "bonus", label: "Bonus" },
    { value: "other_income", label: "Other Income" },
    { value: "food", label: "Food" },
    { value: "transportation", label: "Transportation" },
    { value: "utilities", label: "Utilities" },
    { value: "entertainment", label: "Entertainment" },
    { value: "healthcare", label: "Healthcare" },
    { value: "shopping", label: "Shopping" },
    { value: "rent", label: "Rent" },
    { value: "other_expense", label: "Other Expense" },
  ];

  const initialFormData = {
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "food",
    date: new Date().toISOString().split("T")[0],
    is_paid: "paid",
  };

  const { formData, handleChange, handleSubmit, resetForm, setFormData } = useFormHandler({
    initialValues: initialFormData,
    onSubmit: async (data) => {
      let amountValue: Decimal;
      try {
        amountValue = new Decimal(data.amount || "0");
      } catch {
        alert("Invalid amount format");
        return;
      }

      if (amountValue.isNaN() || amountValue.lessThanOrEqualTo(0)) {
        alert("Please enter a valid amount greater than 0");
        return;
      }

      const transactionPayload: any = {
        description: data.description,
        amount: amountValue.toNumber(),
        type: data.type,
        category: data.category,
        transaction_date: data.date,
      };

      if (initialData?.id) {
        transactionPayload.id = initialData.id;
      }

      if (isLoggedIn && userId) {
        transactionPayload.user_id = userId;
      }

      onSubmit(transactionPayload);
    },
  });

  // Efecto para cargar datos iniciales si estamos editando
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          description: initialData.description || "",
          amount: String(initialData.amount || ""),
          type: initialData.type || "expense",
          category: String(initialData.category || "food"),
          date: initialData.date
            ? new Date(initialData.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          is_paid: (initialData as any).is_paid || "paid",
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e as any);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      amount: e.target.value,
    });
  };

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
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 md:mx-0 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-primary) p-4 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-(--text-primary) tracking-tight uppercase">
                {initialData ? "Edit Transaction" : "New Transaction"}
              </h2>
              {!isLoggedIn && (
                <p className="text-xs text-(--text-secondary) mt-1 font-medium italic">
                  Saving as draft (will be deleted if account not created)
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors group"
            >
              <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <div className="col-span-1">
              <MyDatePicker
                label="Date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-span-1">
              <MySelect
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: "expense", label: "Expense" },
                  { value: "income", label: "Income" },
                ]}
                required
              />
            </div>

            <div className="col-span-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <MySelect
                    label="Payment Status"
                    name="is_paid"
                    value={formData.is_paid}
                    onChange={handleChange}
                    options={[
                      { value: "paid", label: "Paid" },
                      { value: "unpaid", label: "Unpaid" },
                    ]}
                    required
                  />
                </div>
                <div>
                  <MyCurrencyInput
                    label="Amount"
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
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categoryOptions}
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <MyTextArea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleTextAreaChange}
                placeholder="e.g., Coffee, Salary..."
                rows={3}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 md:pt-6 col-span-1 md:col-span-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 md:py-3 bg-(--bg-surface) border-2 border-(--text-secondary) text-(--text-primary) rounded-lg hover:border-(--text-primary) hover:bg-(--bg-secondary) transition-all font-bold uppercase tracking-wider text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 md:py-3 bg-(--accent-primary) text-(--text-inverted) rounded-lg hover:bg-(--accent-hover) transition-all font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base"
              >
                {isLoading
                  ? (initialData ? "Updating..." : "Creating...")
                  : (initialData ? "Update Transaction" : "Create Transaction")
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
