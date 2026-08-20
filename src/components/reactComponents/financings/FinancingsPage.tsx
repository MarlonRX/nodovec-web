import { useEffect, useMemo, useState, useRef, useCallback, useReducer } from "react";
import { getAllCards } from "@/services/cardServices";
import {
  createFinancing,
  getFinancings,
  previewFinancing,
  updateFinancingFull,
  deleteFinancing,
  getFinancingDetails,
  type FinancingInput,
} from "@/services/financingServices";
import type { Financing } from "@/types/financingInterfaces";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { ModalForm } from "./ModalForm";
import { FinancingHeader } from "./FinancingHeader";
import { FinancingLoadingOverlay, FinancingEmptyState } from "./FinancingStates";
import { FinancingListItem } from "./FinancingListItem";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";

type ScheduleRow = { installment_number: number; due_date: string; principal_amount: string; interest_amount: string; total_amount: string; remaining_principal: string };
type Summary = { installment_amount: string; total_interest: string; total_amount: string };

const initialForm: FinancingInput = {
  type: "loan", name: "", description: "", principal_amount: "", annual_interest_rate: "0", calculation_method: "french", payment_frequency: "monthly", installments: 12, first_payment_date: new Date().toISOString().slice(0, 10), currency: "USD", category: "", observations: "", generate_transactions: false, current_installment: 1,
};

interface ModalState {
  isOpen: boolean;
  editingFinancing: Financing | null;
  form: FinancingInput;
  paymentDate: string;
  schedule: ScheduleRow[];
  allInstallments: ScheduleRow[];
  summary: Summary | null;
  installmentsPage: number;
  totalInstallmentsPages: number;
}

type ModalAction =
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_EDITING'; financing: Financing }
  | { type: 'UPDATE_FORM'; field: keyof FinancingInput; value: any }
  | { type: 'SET_PAYMENT_DATE'; date: string }
  | { type: 'SET_SCHEDULE'; schedule: ScheduleRow[] }
  | { type: 'SET_ALL_INSTALLMENTS'; installments: ScheduleRow[] }
  | { type: 'SET_SUMMARY'; summary: Summary | null }
  | { type: 'SET_INSTALLMENTS_PAGE'; page: number }
  | { type: 'SET_TOTAL_PAGES'; pages: number }
  | { type: 'RESET_FORM' };

const initialModalState: ModalState = {
  isOpen: false,
  editingFinancing: null,
  form: initialForm,
  paymentDate: new Date().toISOString().slice(0, 10),
  schedule: [],
  allInstallments: [],
  summary: null,
  installmentsPage: 1,
  totalInstallmentsPages: 1,
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...initialModalState, isOpen: true };
    case 'CLOSE_MODAL':
      return { ...initialModalState, isOpen: false };
    case 'SET_EDITING':
      return { ...state, editingFinancing: action.financing };
    case 'UPDATE_FORM':
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'SET_PAYMENT_DATE':
      return { ...state, paymentDate: action.date };
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.schedule };
    case 'SET_ALL_INSTALLMENTS':
      return { ...state, allInstallments: action.installments };
    case 'SET_SUMMARY':
      return { ...state, summary: action.summary };
    case 'SET_INSTALLMENTS_PAGE':
      return { ...state, installmentsPage: action.page };
    case 'SET_TOTAL_PAGES':
      return { ...state, totalInstallmentsPages: action.pages };
    case 'RESET_FORM':
      return { ...state, form: initialForm, paymentDate: initialForm.first_payment_date, schedule: [], allInstallments: [], summary: null, installmentsPage: 1, totalInstallmentsPages: 1 };
    default:
      return state;
  }
}

interface FinancingsPageProps {
  initialData?: Financing[] | null;
}

export const FinancingsPage = ({ initialData = null }: FinancingsPageProps) => {
  const { t, lang } = useTranslation();
  const [financings, setFinancings] = useState<Financing[]>(initialData ?? []);
  const [loading, setLoading] = useState(false);
  const [modalState, dispatch] = useReducer(modalReducer, initialModalState);
  const cardsRef = useRef<{ uuid: string; name: string; last_four: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Financing | null>(null);
  const [deleting, setDeleting] = useState(false);
  const calculatingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pagination for installments table
  const installmentsPageSize = 10;

  const fetchFinancings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFinancings();
      if (result.response) setFinancings(result.data?.data || []);
      else toast.error(result.message || t("financing.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchFinancings();
    getAllCards().then((r) => { cardsRef.current = r?.data?.data || []; });
  }, [fetchFinancings]);

  const update = <K extends keyof FinancingInput>(key: K, value: FinancingInput[K]) => dispatch({ type: 'UPDATE_FORM', field: key, value });
  const hasAmount = useMemo(() => Boolean(modalState.form.principal_amount && Number(modalState.form.principal_amount) > 0), [modalState.form.principal_amount]);

  const doCalculate = useCallback(async () => {
    if (!hasAmount) return;
    calculatingRef.current = true;
    try {
      const result = await previewFinancing({ ...modalState.form, first_payment_date: modalState.paymentDate });
      if (result.response) {
        const allInst = result.data.schedule;
        dispatch({ type: 'SET_ALL_INSTALLMENTS', installments: allInst });

        const start = (modalState.installmentsPage - 1) * installmentsPageSize;
        const end = start + installmentsPageSize;
        dispatch({ type: 'SET_SCHEDULE', schedule: allInst.slice(start, end) });
        dispatch({ type: 'SET_TOTAL_PAGES', pages: Math.ceil(allInst.length / installmentsPageSize) });

        dispatch({ type: 'SET_SUMMARY', summary: result.data.summary });
      }
    } finally {
      calculatingRef.current = false;
    }
  }, [
    modalState.form,
    modalState.paymentDate,
    modalState.installmentsPage,
    hasAmount,
  ]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { doCalculate(); }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [
    modalState.form.principal_amount,
    modalState.form.annual_interest_rate,
    modalState.form.installments,
    modalState.form.calculation_method,
    modalState.form.payment_frequency,
    modalState.paymentDate,
    doCalculate
  ]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...modalState.form, first_payment_date: modalState.paymentDate };
      const result = modalState.editingFinancing
        ? await updateFinancingFull(modalState.editingFinancing.uuid, payload)
        : await createFinancing(payload);
      if (result.response) {
        toast.success(modalState.editingFinancing ? t("financing.updated") : t("financing.created"));
        closeModal();
        fetchFinancings();
      } else toast.error(result.message);
    } finally {
      setSaving(false);
    }
  };

  const openModal = () => {
    dispatch({ type: 'OPEN_MODAL' });
  };

  const openEditModal = async (f: Financing) => {
    dispatch({ type: 'SET_EDITING', financing: f });
    const firstPaymentDate = f.first_payment_date || new Date().toISOString().slice(0, 10);
    dispatch({ type: 'UPDATE_FORM', field: 'type', value: f.type });
    dispatch({ type: 'UPDATE_FORM', field: 'name', value: f.name });
    dispatch({ type: 'UPDATE_FORM', field: 'description', value: f.description || "" });
    dispatch({ type: 'UPDATE_FORM', field: 'principal_amount', value: String(f.principal_amount) });
    dispatch({ type: 'UPDATE_FORM', field: 'annual_interest_rate', value: String(f.annual_interest_rate) });
    dispatch({ type: 'UPDATE_FORM', field: 'calculation_method', value: f.calculation_method });
    dispatch({ type: 'UPDATE_FORM', field: 'payment_frequency', value: f.payment_frequency });
    dispatch({ type: 'UPDATE_FORM', field: 'installments', value: f.installments });
    dispatch({ type: 'UPDATE_FORM', field: 'first_payment_date', value: firstPaymentDate });
    dispatch({ type: 'UPDATE_FORM', field: 'currency', value: f.currency });
    dispatch({ type: 'UPDATE_FORM', field: 'category', value: f.category || "" });
    dispatch({ type: 'UPDATE_FORM', field: 'observations', value: f.observations || "" });
    dispatch({ type: 'UPDATE_FORM', field: 'card_uuid', value: f.card?.uuid || "" });
    dispatch({ type: 'UPDATE_FORM', field: 'current_installment', value: f.current_installment ?? 1 });
    dispatch({ type: 'UPDATE_FORM', field: 'generate_transactions', value: f.generate_transactions ?? false });
    dispatch({ type: 'SET_PAYMENT_DATE', date: firstPaymentDate });
    dispatch({ type: 'SET_SCHEDULE', schedule: [] });
    dispatch({ type: 'SET_SUMMARY', summary: null });
    dispatch({ type: 'SET_INSTALLMENTS_PAGE', page: 1 });

    const result = await getFinancingDetails(f.uuid, 1, installmentsPageSize);

    if (result.response && result.data) {
      const data = result.data.data || result.data;
      dispatch({ type: 'SET_SCHEDULE', schedule: data.installments?.data || data.installments || [] });
      dispatch({ type: 'SET_TOTAL_PAGES', pages: data.installments?.last_page || 1 });
      dispatch({
        type: 'SET_SUMMARY', summary: {
          installment_amount: data.installments?.data?.[0]?.total_amount || "0",
          total_interest: "0",
          total_amount: "0",
        }
      });
    }

    dispatch({ type: 'OPEN_MODAL' });
  };

  const closeModal = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const result = await deleteFinancing(deleteConfirm.uuid);
      if (result.response) {
        toast.success(t("financing.deleted"));
        setDeleteConfirm(null);
        fetchFinancings();
      } else {
        toast.error(result.message || t("financing.errorDelete"));
      }
    } catch {
      toast.error(t("financing.errorDelete"));
    } finally {
      setDeleting(false);
    }
  }, [deleteConfirm, fetchFinancings, t]);

  // Load installments for editing mode with pagination
  useEffect(() => {
    if (!modalState.isOpen || !modalState.editingFinancing) return;

    let cancelled = false;
    const loadInstallments = async () => {
      const result = await getFinancingDetails(modalState.editingFinancing!.uuid, modalState.installmentsPage, installmentsPageSize);

      if (cancelled) return;
      if (result.response && result.data) {
        const data = result.data.data || result.data;
        dispatch({ type: 'SET_SCHEDULE', schedule: data.installments?.data || data.installments || [] });
        dispatch({ type: 'SET_TOTAL_PAGES', pages: data.installments?.last_page || 1 });
      }
    };

    loadInstallments();
    return () => { cancelled = true; };
  }, [modalState.isOpen, modalState.editingFinancing, modalState.installmentsPage]);

  // Handle pagination for new financing (local pagination)
  useEffect(() => {
    if (!modalState.isOpen || modalState.editingFinancing || modalState.allInstallments.length === 0) return;

    const start = (modalState.installmentsPage - 1) * installmentsPageSize;
    const end = start + installmentsPageSize;
    dispatch({ type: 'SET_SCHEDULE', schedule: modalState.allInstallments.slice(start, end) });
  }, [modalState.installmentsPage, modalState.isOpen, modalState.editingFinancing, modalState.allInstallments]);

  const totalSum = useMemo(() => financings.reduce((s: number, f: Financing) => s + Number(f.principal_amount || 0), 0), [financings]);
  const activeCount = useMemo(() => financings.filter((f: Financing) => f.status === "active").length, [financings]);
  const totalMonthly = useMemo(() => financings.filter((f: Financing) => f.status === "active").reduce((s: number, f: Financing) => s + Number(f.monthly_payment || 0), 0), [financings]);

  return (
    <div className="table-page-container" aria-labelledby="financing-title">

      <FinancingHeader
        totalSum={totalSum}
        activeCount={activeCount}
        totalMonthly={totalMonthly}
        onNewPlan={openModal}
        t={t}
      />

      {loading && <FinancingLoadingOverlay t={t} />}

      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {!loading && financings.length === 0 && (
          <FinancingEmptyState onNewPlan={openModal} t={t} />
        )}

        {!loading && financings.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {financings.map((f: Financing) => (
              <FinancingListItem
                key={f.uuid}
                financing={f}
                onEdit={openEditModal}
                onDelete={() => setDeleteConfirm(f)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      <ModalForm
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSubmit={submit}
        editingFinancing={modalState.editingFinancing}
        form={modalState.form}
        update={update}
        paymentDate={modalState.paymentDate}
        setPaymentDate={(date: string) => dispatch({ type: 'SET_PAYMENT_DATE', date })}
        schedule={modalState.schedule}
        summary={modalState.summary}
        saving={saving}
        loadingInstallments={false}
        lang={lang}
        t={t}
      />

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t("financing.confirmDeleteTitle")}
        description={t("financing.confirmDeleteDescription").replace("${name}", deleteConfirm?.name || "")}
        isLoading={deleting}
      />

    </div>
  );
};
