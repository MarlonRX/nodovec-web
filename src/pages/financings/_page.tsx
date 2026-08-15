import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Calculator, Landmark, CreditCard, Plus, X, Info, Pencil, Zap, Calendar, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MyDatePicker } from "@/components/UIComponents/MyDatePicker";
import { getAllCards } from "@/services/cardServices";
import { createFinancing, getFinancings, previewFinancing, updateFinancingFull, getFinancingDetails, type FinancingInput } from "@/services/financingServices";
import { formatMoney } from "@/utils/cardFinance";
import { translate, getCurrentLanguage, type Language } from "@/i18n";
import { toast } from "sonner";
import { ModalForm } from "./partials/ModalForm";

type ScheduleRow = { installment_number: number; due_date: string; principal_amount: string; interest_amount: string; total_amount: string; remaining_principal: string };
type Summary = { installment_amount: string; total_interest: string; total_amount: string };

const initialForm: FinancingInput = {
  type: "loan", name: "", description: "", principal_amount: "", annual_interest_rate: "0", calculation_method: "french", payment_frequency: "monthly", installments: 12, first_payment_date: new Date().toISOString().slice(0, 10), currency: "USD", category: "", observations: "", generate_transactions: false, current_installment: 1,
};

function Tip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label="Info" className="inline-flex size-5 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:text-(--accent-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-primary)/50 ml-1 shrink-0">
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-55 text-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const categoryOptions = [
  { value: 'food', label: 'Food' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'rent', label: 'Rent' },
  { value: 'other_expense', label: 'Other' },
];

function formatRate(rate: string): string {
  const num = Number(rate);
  if (isNaN(num)) return "0%";
  return `${num.toFixed(2)}%`;
}

function getNextPaymentDate(firstPaymentDate: string, frequency: string, currentInstallment: number): string | null {
  if (!firstPaymentDate || !currentInstallment) return null;
  const date = new Date(firstPaymentDate + 'T00:00:00');
  const offset = currentInstallment - 1;
  switch (frequency) {
    case 'weekly': date.setDate(date.getDate() + offset * 7); break;
    case 'biweekly': date.setDate(date.getDate() + offset * 14); break;
    default: date.setMonth(date.getMonth() + offset); break;
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const FinancingsPage = () => {
  const [financings, setFinancings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFinancing, setEditingFinancing] = useState<any>(null);
  const [form, setForm] = useState(initialForm);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [cards, setCards] = useState<{ uuid: string; name: string; last_four: string }[]>([]);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [allInstallments, setAllInstallments] = useState<ScheduleRow[]>([]); // Store all installments for local pagination
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Pagination for installments table
  const [installmentsPage, setInstallmentsPage] = useState(1);
  const [installmentsPageSize] = useState(10);
  const [totalInstallmentsPages, setTotalInstallmentsPages] = useState(1);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const onLanguage = (event: Event) => setLang((event as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLanguage);
    fetchFinancings();
    getAllCards().then((r) => setCards(r?.data?.data || []));
    return () => window.removeEventListener("languageChanged", onLanguage);
  }, []);

  const fetchFinancings = async () => {
    setLoading(true);
    const result = await getFinancings();
    setLoading(false);
    if (result.response) setFinancings(result.data?.data || []);
    else toast.error(result.message || t("financing.errorLoad"));
  };

  const update = <K extends keyof FinancingInput>(key: K, value: FinancingInput[K]) => setForm((c) => ({ ...c, [key]: value }));
  const hasAmount = useMemo(() => Boolean(form.principal_amount && Number(form.principal_amount) > 0), [form.principal_amount]);

  const doCalculate = useCallback(async () => {
    if (!hasAmount) return;
    setCalculating(true);
    const result = await previewFinancing({ ...form, first_payment_date: paymentDate });
    setCalculating(false);
    if (result.response) { 
      const allInst = result.data.schedule;
      setAllInstallments(allInst); // Store all installments
      
      // Paginate based on current page
      const start = (installmentsPage - 1) * installmentsPageSize;
      const end = start + installmentsPageSize;
      setSchedule(allInst.slice(start, end));
      setTotalInstallmentsPages(Math.ceil(allInst.length / installmentsPageSize));
      
      setSummary(result.data.summary); 
    }
  }, [
    form.principal_amount,
    form.annual_interest_rate,
    form.installments,
    form.calculation_method,
    form.payment_frequency,
    hasAmount,
    paymentDate,
    installmentsPage,
    installmentsPageSize
  ]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { doCalculate(); }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [
    form.principal_amount,
    form.annual_interest_rate,
    form.installments,
    form.calculation_method,
    form.payment_frequency,
    paymentDate,
    doCalculate
  ]);

  const calculate = async () => { doCalculate(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, first_payment_date: paymentDate };
    const result = editingFinancing
      ? await updateFinancingFull(editingFinancing.uuid, payload)
      : await createFinancing(payload);
    setSaving(false);
    if (result.response) {
      toast.success(editingFinancing ? t("financing.updated") : t("financing.created"));
      closeModal();
      fetchFinancings();
    } else toast.error(result.message);
  };

  const openModal = () => { 
    setEditingFinancing(null); 
    setForm(initialForm); 
    setPaymentDate(initialForm.first_payment_date); 
    setSchedule([]); 
    setAllInstallments([]);
    setSummary(null); 
    setInstallmentsPage(1);
    setTotalInstallmentsPages(1);
    setModalOpen(true); 
  };

  const openEditModal = async (f: any) => {
    setEditingFinancing(f);
    const firstPaymentDate = f.first_payment_date || new Date().toISOString().slice(0, 10);
    setForm({
      type: f.type, name: f.name, description: f.description || "", principal_amount: String(f.principal_amount),
      annual_interest_rate: String(f.annual_interest_rate), calculation_method: f.calculation_method,
      payment_frequency: f.payment_frequency, installments: f.installments,
      first_payment_date: firstPaymentDate, currency: f.currency, category: f.category || "",
      observations: f.observations || "", card_uuid: f.card?.uuid || "",
      current_installment: f.current_installment ?? 1,
      generate_transactions: f.generate_transactions ?? false,
    });
    setPaymentDate(firstPaymentDate);
    setSchedule([]); 
    setSummary(null);
    setInstallmentsPage(1);
    
    // Load financing details with paginated installments
    setLoadingInstallments(true);
    const result = await getFinancingDetails(f.uuid, 1, installmentsPageSize);
    setLoadingInstallments(false);
    
    if (result.response && result.data) {
      const data = result.data.data || result.data;
      setSchedule(data.installments?.data || data.installments || []);
      setTotalInstallmentsPages(data.installments?.last_page || 1);
      setSummary({
        installment_amount: data.installments?.data?.[0]?.total_amount || "0",
        total_interest: "0",
        total_amount: "0",
      });
    }
    
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFinancing(null);
    setForm(initialForm);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setSchedule([]);
    setAllInstallments([]);
    setSummary(null);
    setInstallmentsPage(1);
    setTotalInstallmentsPages(1);
  };

  // Load installments for editing mode with pagination
  useEffect(() => {
    if (!modalOpen || !editingFinancing) return;
    
    const loadInstallments = async () => {
      setLoadingInstallments(true);
      const result = await getFinancingDetails(editingFinancing.uuid, installmentsPage, installmentsPageSize);
      setLoadingInstallments(false);
      
      if (result.response && result.data) {
        const data = result.data.data || result.data;
        setSchedule(data.installments?.data || data.installments || []);
        setTotalInstallmentsPages(data.installments?.last_page || 1);
      }
    };
    
    loadInstallments();
  }, [modalOpen, editingFinancing, installmentsPage, installmentsPageSize]);

  // Handle pagination for new financing (local pagination)
  useEffect(() => {
    if (!modalOpen || editingFinancing || allInstallments.length === 0) return;
    
    // For new financing, paginate the stored installments locally
    const start = (installmentsPage - 1) * installmentsPageSize;
    const end = start + installmentsPageSize;
    setSchedule(allInstallments.slice(start, end));
  }, [installmentsPage, modalOpen, editingFinancing, allInstallments, installmentsPageSize]);

  const totalSum = useMemo(() => financings.reduce((s: number, f: any) => s + Number(f.principal_amount || 0), 0), [financings]);
  const activeCount = useMemo(() => financings.filter((f: any) => f.status === "active").length, [financings]);
  const totalMonthly = useMemo(() => financings.filter((f: any) => f.status === "active").reduce((s: number, f: any) => s + Number(f.monthly_payment || 0), 0), [financings]);

  return (
    <div className="table-page-container" aria-labelledby="financing-title">

      {/* Header */}
      <div className="flex flex-col gap-4 mb-2 border-b border-(--border-primary) pb-6 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="financing-title" className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase">{t("financing.title")}</h2>
            <p className="text-(--text-tertiary) text-sm uppercase font-bold tracking-wider">{t("financing.subtitle")}</p>
          </div>
          <button onClick={openModal}
            className="group flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg">
            <Plus className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-90" />
            <span>{t("financing.newPlan")}</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="flex flex-col items-center md:items-start p-3 md:p-4 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-wider mb-1 flex items-center">{t("financing.totalFinanced")}<Tip text={t("financing.tipFinanced")} /></span>
            <span className="font-black text-base md:text-lg text-(--text-primary)">${formatMoney(totalSum)}</span>
          </div>
          <div className="flex flex-col items-center md:items-start p-3 md:p-4 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-wider mb-1 flex items-center">{t("financing.activePlans")}<Tip text={t("financing.tipActive")} /></span>
            <span className="font-black text-base md:text-lg" style={{ color: 'var(--accent-primary)' }}>{activeCount}</span>
          </div>
          <div className="flex flex-col items-center md:items-start p-3 md:p-4 rounded-lg bg-(--bg-secondary)">
            <span className="text-(--text-tertiary) text-xs uppercase font-bold tracking-wider mb-1 flex items-center">{t("financing.monthlyPayment")}<Tip text={t("financing.tipMonthlyDue")} /></span>
            <span className="font-black text-base md:text-lg" style={{ color: totalMonthly > 0 ? 'var(--accent-primary)' : 'var(--text-primary)' }}>${formatMoney(totalMonthly)}</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-100 flex items-center justify-center">
          <div className="bg-(--bg-surface) p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="font-bold text-sm uppercase tracking-widest text-(--text-secondary)">{t("financing.loading")}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {!loading && financings.length === 0 && (
          <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
            <div className="w-20 h-20 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center">
              <Landmark className="w-10 h-10 text-(--accent-primary)" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-(--text-primary) uppercase tracking-tight mb-2">
                {t("financing.noPlans")}
              </h3>
              <p className="text-(--text-secondary) text-sm md:text-base mb-6">
                {t("financing.noPlansHint")}
              </p>
              <button onClick={openModal}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 mx-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg">
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                {t("financing.createFirst")}
              </button>
            </div>
          </div>
        )}

        {!loading && financings.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {financings.map((f: any) => {
              const nextPayment = getNextPaymentDate(f.first_payment_date, f.payment_frequency, f.current_installment);
              const isCard = f.type === "card_purchase";
              return (
                <div key={f.uuid}
                  className="rounded-xl p-4 md:p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-default"
                  style={{ border: '1px solid var(--border-primary)', backgroundColor: 'var(--bg-surface)' }}>

                  <div className="flex items-center gap-4">
                    {/* Icon + Type */}
                    <div className="shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: isCard ? 'rgba(59,130,246,0.12)' : 'rgba(var(--accent-primary-rgb), 0.12)' }}>
                        {isCard
                          ? <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                          : <Landmark className="w-6 h-6 md:w-7 md:h-7 text-(--accent-primary)" />
                        }
                      </div>
                    </div>

                    {/* Main Info */}
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

                    {/* Amount + Rate */}
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

                    {/* Installment + Next Payment */}
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

                    {/* Edit Button */}
                    <button type="button" onClick={(e) => { e.stopPropagation(); openEditModal(f); }}
                      className="shrink-0 p-2.5 rounded-xl transition-all hover:scale-105 group"
                      aria-label={t("financing.editPlan")}
                      style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.08)', color: 'var(--accent-primary)' }}>
                      <Pencil className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  {/* Mobile: Amount + Rate + Installment */}
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
            })}
          </div>
        )}
      </div>

      {/* Modal Form */}
      <ModalForm
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={submit}
        editingFinancing={editingFinancing}
        form={form}
        update={update}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        schedule={schedule}
        summary={summary}
        saving={saving}
        loadingInstallments={loadingInstallments}
        lang={lang}
        t={t}
      />
      
    </div>
  );
};
