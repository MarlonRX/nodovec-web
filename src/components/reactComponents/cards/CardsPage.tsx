import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { MyTable } from "@/components/UIComponents/MyTable";
import { CardModal } from "@/components/UIComponents/CardModal";
import { CardPurchasesModal } from "@/components/UIComponents/CardPurchasesModal";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";
import { getCards, createCard, updateCard, deleteCard } from "@/services/cardServices";
import { CardPaginatedResponseSchema, type Card } from "@/schemas/tableSchema";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { useCardsColumns } from "./useCardsColumns";
import { CardsEmptyState } from "./CardsEmptyState";

export interface CardsInitialData {
  data: Card[];
  totalPages: number;
}

interface CardsPageProps {
  initialData?: CardsInitialData | null;
}

export const CardsPage = ({ initialData = null }: CardsPageProps) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Card[]>(initialData?.data ?? []);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [purchasesCard, setPurchasesCard] = useState<Card | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCards({ page: currentPage });
      const validated = CardPaginatedResponseSchema.parse(result);
      if (validated.response) {
        setData(validated.data.data);
        setTotalPages(validated.data.last_page);
      } else {
        toast.error(validated.message || t('cards.errorLoad'));
        setData([]);
      }
    } catch (err: any) {
      toast.error(err?.message || t('cards.errorLoad'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, t]);

  useEffect(() => { fetchCards(); }, [currentPage, refreshTrigger, fetchCards]);

  const handleSubmit = async (cardData: Partial<Card>) => {
    setIsSubmitting(true);
    try {
      const result = editingCard?.uuid ? await updateCard(editingCard.uuid, cardData) : await createCard(cardData);
      if (result.response) {
        toast.success(editingCard ? t('cards.updated') : t('cards.created'));
        setIsModalOpen(false);
        setEditingCard(null);
        setRefreshTrigger(p => p + 1);
      } else {
        toast.error(result.message || t('cards.errorCreate'));
      }
    } catch (err: any) {
      toast.error(err?.message || t('common.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteCard(uuid);
      if (result.response) {
        toast.success(t('cards.deleted'));
        setRefreshTrigger(p => p + 1);
      } else toast.error(result.message || t('cards.errorDelete'));
    } catch (err: any) {
      toast.error(err?.message || t('common.unexpectedError'));
    } finally {
      setCardToDelete(null);
      setIsDeleting(false);
    }
  };

  const openCreateModal = () => { setEditingCard(null); setIsModalOpen(true); };
  const openEditModal = (card: Card) => { setEditingCard(card); setIsModalOpen(true); };

  const columns = useCardsColumns({
    t,
    onViewPurchases: setPurchasesCard,
    onEdit: openEditModal,
    onDelete: (card) => setCardToDelete(card.uuid),
  });

  return (
    <div className="table-page-container">
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-100 flex items-center justify-center">
          <div className="bg-(--bg-surface) p-6 rounded-none shadow-2xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="font-bold text-sm text-(--text-secondary)">{t('common.loading')}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 mb-6 border-b border-(--border-primary) pb-6 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-4xl font-semibold text-(--text-primary) tracking-tight">{t('cards.title')}</h2>
            <p className="text-(--text-tertiary) text-xs font-bold tracking-wide">{t('cards.subtitle')}</p>
          </div>
          <button onClick={openCreateModal}
            className="group flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-none transition-colors font-semibold text-xs md:text-sm w-full sm:w-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            {t('cards.addCard')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {data.length > 0 ? (
          <MyTable data={data} columns={columns} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} variant="excel" showPagination />
        ) : (
          <CardsEmptyState onAdd={openCreateModal} t={t} />
        )}
      </div>

      <CardModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingCard(null); }}
        onSubmit={handleSubmit} isLoading={isSubmitting} initialData={editingCard} />

      {purchasesCard && (
        <CardPurchasesModal isOpen={!!purchasesCard} onClose={() => setPurchasesCard(null)}
          card={purchasesCard} onBalanceChange={() => setRefreshTrigger(p => p + 1)} />
      )}

      <DeleteConfirmModal isOpen={cardToDelete !== null} onClose={() => setCardToDelete(null)}
        onConfirm={() => cardToDelete && handleDelete(cardToDelete)} isLoading={isDeleting} />
    </div>
  );
};
