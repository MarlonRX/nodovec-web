import { useState, useEffect, useCallback } from "react";
import { ReactNode } from "react";
import { Plus, Pencil, Trash2, CreditCard, List } from "lucide-react";
import { MyTable } from "@/components/UIComponents/MyTable";
import { CardModal } from "@/components/UIComponents/CardModal";
import { CardPurchasesModal } from "@/components/UIComponents/CardPurchasesModal";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";
import { getCards, createCard, updateCard, deleteCard } from "@/services/cardServices";
import { CardPaginatedResponseSchema, type Card } from "@/schemas/tableSchema";
import { translate, getCurrentLanguage, type Language } from "@/i18n";
import { formatMonthYear } from "@/utils/dateFormat";
import { toast } from "sonner";

const numberFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fmt(n: number) {
  return numberFormatter.format(n);
}

export const CardsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [purchasesCard, setPurchasesCard] = useState<Card | null>(null);
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCards({ page: currentPage });
      const validated = CardPaginatedResponseSchema.parse(result);
      if (validated.response) {
        setData(validated.data.data);
        setTotalPages(validated.data.last_page);
      } else {
        toast.error(validated.message || translate('cards.errorLoad', getCurrentLanguage()));
        setData([]);
      }
    } catch (err: any) {
      toast.error(err?.message || translate('cards.errorLoad', getCurrentLanguage()));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

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
    } catch (err: any) { toast.error(err?.message || t('common.unexpectedError')); }
    finally { setCardToDelete(null); setIsDeleting(false); }
  };

  const columns: Array<{ key: keyof Card | 'actions'; label: string; sortable: boolean; render?: (value: any, row: Card) => ReactNode }> = [
    {
      key: 'type', label: t('cards.colType'), sortable: false,
      render: (value: string): ReactNode => (
        <span style={{
          backgroundColor: value === 'credit' ? 'rgba(123,31,162,0.12)' : 'rgba(25,118,210,0.12)',
          color: value === 'credit' ? '#7B1FA2' : '#1976D2',
          border: `1px solid ${value === 'credit' ? 'rgba(123,31,162,0.25)' : 'rgba(25,118,210,0.25)'}`,
        }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">
          <CreditCard size={12} />{value === 'credit' ? t('cards.typeCredit') : t('cards.typeDebit')}
        </span>
      ),
    },
    { key: 'name', label: t('cards.colName'), sortable: true },
    { key: 'bank', label: t('cards.colBank'), sortable: true },
    {
      key: 'last_four', label: t('cards.colNumber'), sortable: false,
      render: (value: string): ReactNode => <span className="font-mono text-sm text-(--text-secondary)">•••• •••• •••• {value}</span>,
    },
    {
      key: 'current_balance', label: t('cards.colDebt'), sortable: false,
      render: (value: number): ReactNode => (
        <span className="font-bold" style={{ color: value > 0 ? 'var(--semantic-error)' : 'var(--text-secondary)' }}>${fmt(value ?? 0)}</span>
      ),
    },
    {
      key: 'credit_limit', label: t('cards.colLimit'), sortable: false,
      render: (value: number | null): ReactNode =>
        value != null ? <span className="text-(--text-secondary)">${fmt(value)}</span> : <span className="text-(--text-tertiary) text-xs">—</span>,
    },
    {
      key: 'expiry_date', label: t('cards.colExpiry'), sortable: false,
      render: (value: string): ReactNode => <span className="font-mono text-xs">{formatMonthYear(value)}</span>,
    },
    {
      key: 'is_active', label: t('cards.colStatus'), sortable: false,
      render: (value: boolean): ReactNode => (
        <span style={{
          backgroundColor: value ? 'rgba(52,168,83,0.12)' : 'rgba(207,102,121,0.12)',
          color: value ? '#34A853' : '#CF6679',
          border: `1px solid ${value ? 'rgba(52,168,83,0.25)' : 'rgba(207,102,121,0.25)'}`,
        }} className="inline-block px-3 py-1 rounded-lg font-semibold text-xs uppercase tracking-wider">
          {value ? t('cards.statusActive') : t('cards.statusInactive')}
        </span>
      ),
    },
    {
      key: 'actions', label: t('cards.colActions'), sortable: false,
      render: (_: any, row: Card): ReactNode => (
        <div className="flex gap-1.5">
          {row.type === 'credit' && (
            <button onClick={(e) => { e.stopPropagation(); setPurchasesCard(row); }} title={t('cards.titlePurchases')}
              className="p-1.5 rounded-lg transition-colors text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)">
              <List className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setEditingCard(row); setIsModalOpen(true); }}
            className="p-1.5 rounded-lg transition-colors text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)" title={t('common.edit')}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCardToDelete(row.uuid); }}
            className="p-1.5 rounded-lg transition-colors text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)]" title={t('common.delete')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="table-page-container">
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-100 flex items-center justify-center">
          <div className="bg-(--bg-surface) p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <p className="font-bold text-sm uppercase tracking-widest text-(--text-secondary)">{t('common.loading')}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 mb-6 border-b border-(--border-primary) pb-6 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase">{t('cards.title')}</h2>
            <p className="text-(--text-tertiary) text-xs uppercase font-bold tracking-widest">{t('cards.subtitle')}</p>
          </div>
          <button onClick={() => { setEditingCard(null); setIsModalOpen(true); }}
            className="group flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-xl transition-colors transition-transform font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 w-full sm:w-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            {t('cards.addCard')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {data.length > 0 ? (
          <MyTable data={data} columns={columns} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} variant="excel" showPagination />
        ) : (
          <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
            <div className="w-20 h-20 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-(--accent-primary)" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-(--text-primary) uppercase tracking-tight mb-2">{t('cards.noCards')}</h3>
              <p className="text-(--text-secondary) text-sm mb-6">{t('cards.noCardsHint')}</p>
              <button onClick={() => { setEditingCard(null); setIsModalOpen(true); }}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-colors transition-transform font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 mx-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)">
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                {t('cards.addFirstCard')}
              </button>
            </div>
          </div>
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
