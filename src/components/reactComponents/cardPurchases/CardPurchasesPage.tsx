import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronRight, CreditCard } from "lucide-react";
import { MyTable } from "@/components/UIComponents/MyTable";
import { CardPurchaseModal } from "@/components/UIComponents/CardPurchaseModal";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";
import { getCardPurchases, createCardPurchase, updateCardPurchase, deleteCardPurchase, advanceInstallment } from "@/services/cardPurchaseServices";
import { getCards } from "@/services/cardServices";
import { CardPurchasePaginatedResponseSchema, type CardPurchase, type Card } from "@/schemas/tableSchema";
import { useTranslation } from "@/hooks/useTranslation";
import { formatNumber } from "@/lib/currencyFormatter";
import { toast } from "sonner";
import { useCardPurchasesColumns } from "./useCardPurchasesColumns";
import { CardPurchasesEmptyState } from "./CardPurchasesEmptyState";

export interface CardPurchasesInitialData {
  data: CardPurchase[];
  totalPages: number;
}

interface CardPurchasesPageProps {
  cardUuid: string;
  initialData?: CardPurchasesInitialData | null;
}

export const CardPurchasesPage = ({ cardUuid, initialData = null }: CardPurchasesPageProps) => {
  const { t } = useTranslation();
  const [card, setCard] = useState<Card | null>(null);
  const [data, setData] = useState<CardPurchase[]>(initialData?.data ?? []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CardPurchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load card info
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result = await getCards({ page: 1, page_size: 100 });
      if (cancelled) return;
      if (result.response) {
        const found = result.data?.data?.find((c: Card) => c.uuid === cardUuid);
        setCard(found || null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [cardUuid]);

  // Load purchases
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getCardPurchases(cardUuid, { page: currentPage });
        if (cancelled) return;
        const validated = CardPurchasePaginatedResponseSchema.parse(result);
        if (validated.response) {
          setData(validated.data.data);
          setTotalPages(validated.data.last_page);
        } else {
          toast.error(validated.message);
          setData([]);
        }
      } catch (err: any) {
        if (cancelled) return;
        toast.error(err?.message || t("purchaseForm.loadingError"));
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [cardUuid, currentPage, refreshTrigger, t]);

  const handleSubmit = async (purchaseData: Partial<CardPurchase>) => {
    setIsSubmitting(true);
    try {
      const result = editingPurchase?.uuid
        ? await updateCardPurchase(cardUuid, editingPurchase.uuid, purchaseData)
        : await createCardPurchase(cardUuid, purchaseData);

      if (result.response) {
        toast.success(editingPurchase ? t("purchaseForm.purchaseUpdated") : t("purchaseForm.purchaseCreated"));
        setIsModalOpen(false);
        setEditingPurchase(null);
        setRefreshTrigger(p => p + 1);
      } else {
        toast.error(result.message || t("purchaseForm.errorProcessing"));
      }
    } catch (err: any) {
      toast.error(err?.message || t("common.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteCardPurchase(cardUuid, uuid);
      if (result.response) {
        toast.success(t("purchaseForm.purchaseDeleted"));
        setRefreshTrigger(p => p + 1);
      } else {
        toast.error(result.message || t("purchaseForm.errorDeleting"));
      }
    } catch (err: any) {
      toast.error(err?.message || t("common.unexpectedError"));
    } finally {
      setPurchaseToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleAdvance = async (purchase: CardPurchase) => {
    const result = await advanceInstallment(cardUuid, purchase.uuid);
    if (result.response) {
      toast.success(t("purchases.installmentAdvanced").replace("{n}", String(purchase.current_installment + 1)).replace("{total}", String(purchase.installments)));
      setRefreshTrigger(p => p + 1);
    } else {
      toast.error(result.message || t("purchaseForm.errorAdvancing"));
    }
  };

  const totalMonthlyDue = data.filter(p => p.current_installment <= p.installments).reduce((sum, p) => sum + p.installment_amount, 0);
  const activePurchases = data.filter(p => p.current_installment <= p.installments).length;
  const completedPurchases = data.filter(p => p.current_installment > p.installments).length;

  const openCreateModal = () => { setEditingPurchase(null); setIsModalOpen(true); };

  const columns = useCardPurchasesColumns({
    t,
    onAdvance: handleAdvance,
    onEdit: (purchase) => { setEditingPurchase(purchase); setIsModalOpen(true); },
    onDelete: (purchase) => setPurchaseToDelete(purchase.uuid),
  });

  return (
    <div className="table-page-container">
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-100 flex items-center justify-center">
          <div className="bg-(--bg-surface) p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="font-bold text-sm uppercase tracking-widest text-(--text-secondary)">{t('purchaseForm.loading')}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-6 mb-6 border-b border-(--border-primary) pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <a href="/cards/table" className="text-(--text-tertiary) text-xs font-bold uppercase tracking-widest hover:text-(--accent-primary) transition-colors">{t('purchaseForm.breadCrumbCards')}</a>
              <ChevronRight size={12} className="text-(--text-tertiary)" />
              <span className="text-(--text-secondary) text-xs font-bold uppercase tracking-widest">{t('purchaseForm.breadCrumbPurchases')}</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase flex items-center gap-3">
              <CreditCard size={28} style={{ color: 'var(--accent-primary)' }} />
              {card ? `${card.name} •••• ${card.last_four}` : t('purchaseForm.title')}
            </h2>
            {card && <p className="text-(--text-tertiary) text-xs uppercase font-bold tracking-widest mt-1">{card.bank} · {t('purchaseForm.creditCard')}</p>}
          </div>
          <button onClick={openCreateModal}
            className="group flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-xl transition-colors transition-transform font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 w-full sm:w-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            {t('purchaseForm.addPurchase')}
          </button>
        </div>

        {/* Summary cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-1">{t('purchaseForm.monthlyDue')}</p>
              <p className="text-2xl font-black" style={{ color: 'var(--accent-primary)' }}>${formatNumber(totalMonthlyDue)}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-1">{t('purchaseForm.active')}</p>
              <p className="text-2xl font-black text-(--text-primary)">{activePurchases}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-1">{t('purchaseForm.completed')}</p>
              <p className="text-2xl font-black" style={{ color: 'var(--semantic-success)' }}>{completedPurchases}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {data.length > 0 ? (
          <MyTable data={data} columns={columns} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} variant="excel" showPagination={true} />
        ) : (
          <CardPurchasesEmptyState onAdd={openCreateModal} t={t} />
        )}
      </div>

      <CardPurchaseModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingPurchase(null); }}
        onSubmit={handleSubmit} isLoading={isSubmitting} initialData={editingPurchase} />
      <DeleteConfirmModal isOpen={purchaseToDelete !== null} onClose={() => setPurchaseToDelete(null)}
        onConfirm={() => purchaseToDelete && handleDelete(purchaseToDelete)} isLoading={isDeleting} />
    </div>
  );
};
