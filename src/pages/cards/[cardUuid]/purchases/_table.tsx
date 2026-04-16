import { useState, useEffect } from "react";
import { ReactNode } from "react";
import { Plus, Pencil, Trash2, ChevronRight, CreditCard, TrendingUp, RotateCw } from "lucide-react";
import { MyTable } from "@/components/UIComponents/MyTable";
import { CardPurchaseModal } from "@/components/UIComponents/CardPurchaseModal";
import { DeleteConfirmModal } from "@/components/UIComponents/DeleteConfirmModal";
import { getCardPurchases, createCardPurchase, updateCardPurchase, deleteCardPurchase, advanceInstallment } from "@/services/cardPurchaseServices";
import { getCards } from "@/services/cardServices";
import { CardPurchasePaginatedResponseSchema, type CardPurchase, type Card } from "@/schemas/tableSchema";
import { toast } from "sonner";

interface Props { cardUuid: string; }

export const CardDetailTable = ({ cardUuid }: Props) => {
  const [card, setCard] = useState<Card | null>(null);
  const [data, setData] = useState<CardPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CardPurchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load card info
  useEffect(() => {
    const load = async () => {
      const result = await getCards({ page: 1, page_size: 100 });
      if (result.response) {
        const found = result.data?.data?.find((c: Card) => c.uuid === cardUuid);
        setCard(found || null);
      }
    };
    load();
  }, [cardUuid]);

  // Load purchases
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getCardPurchases(cardUuid, { page: currentPage });
        const validated = CardPurchasePaginatedResponseSchema.parse(result);
        if (validated.response) {
          setData(validated.data.data);
          setTotalPages(validated.data.last_page);
        } else {
          toast.error(validated.message);
          setData([]);
        }
      } catch (err: any) {
        toast.error(err?.message || "Error loading purchases");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cardUuid, currentPage, refreshTrigger]);

  const handleSubmit = async (purchaseData: Partial<CardPurchase>) => {
    setIsSubmitting(true);
    try {
      const result = editingPurchase?.uuid
        ? await updateCardPurchase(cardUuid, editingPurchase.uuid, purchaseData)
        : await createCardPurchase(cardUuid, purchaseData);

      if (result.response) {
        toast.success(editingPurchase ? "Purchase updated" : "Purchase created");
        setIsModalOpen(false);
        setEditingPurchase(null);
        setRefreshTrigger(p => p + 1);
      } else {
        toast.error(result.message || "Error processing purchase");
      }
    } catch (err: any) {
      toast.error(err?.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteCardPurchase(cardUuid, uuid);
      if (result.response) {
        toast.success("Purchase deleted");
        setRefreshTrigger(p => p + 1);
      } else {
        toast.error(result.message || "Error deleting purchase");
      }
    } catch (err: any) {
      toast.error(err?.message || "Unexpected error");
    } finally {
      setPurchaseToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleAdvance = async (purchase: CardPurchase) => {
    const result = await advanceInstallment(cardUuid, purchase.uuid);
    if (result.response) {
      toast.success(`Installment advanced to ${purchase.current_installment + 1}`);
      setRefreshTrigger(p => p + 1);
    } else {
      toast.error(result.message || "Error advancing installment");
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  // Summary stats
  const totalMonthlyDue = data.filter(p => p.current_installment <= p.installments).reduce((sum, p) => sum + p.installment_amount, 0);
  const activePurchases = data.filter(p => p.current_installment <= p.installments).length;
  const completedPurchases = data.filter(p => p.current_installment > p.installments).length;

  const columns: Array<{ key: keyof CardPurchase | 'progress' | 'actions'; label: string; sortable: boolean; render?: (value: any, row: CardPurchase) => ReactNode }> = [
    { key: 'description', label: 'Description', sortable: true },
    {
      key: 'total_amount', label: 'Total', sortable: false,
      render: (v: number) => <span className="font-bold text-(--text-primary)">${fmt(v)}</span>,
    },
    {
      key: 'installment_amount', label: 'Monthly', sortable: false,
      render: (v: number) => <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>${fmt(v)}</span>,
    },
    {
      key: 'interest_rate', label: 'Rate', sortable: false,
      render: (v: number) => <span className="text-xs text-(--text-secondary)">{v}%</span>,
    },
    {
      key: 'progress', label: 'Installments', sortable: false,
      render: (_: any, row: CardPurchase): ReactNode => {
        const pct = Math.round((row.current_installment - 1) / row.installments * 100);
        const done = row.current_installment > row.installments;
        return (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: done ? 'var(--semantic-success)' : 'var(--text-secondary)' }}>
                {done ? 'Paid off' : `${row.current_installment}/${row.installments}`}
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="h-full rounded-full transition-all" style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: done ? 'var(--semantic-success)' : 'var(--accent-primary)',
              }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'purchase_date', label: 'Date', sortable: true,
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: CardPurchase): ReactNode => (
        <div className="flex gap-1.5">
          {row.current_installment <= row.installments && (
            <button onClick={(e) => { e.stopPropagation(); handleAdvance(row); }}
              title="Advance installment"
              className="p-1.5 rounded-lg transition-colors text-(--text-secondary) hover:text-(--semantic-success) hover:bg-[rgba(52,168,83,0.1)]">
              <RotateCw className="w-4 h-4" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setEditingPurchase(row); setIsModalOpen(true); }}
            className="p-1.5 rounded-lg transition-colors text-(--text-secondary) hover:text-(--accent-primary) hover:bg-(--bg-hover)" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setPurchaseToDelete(row.uuid); }}
            className="p-1.5 rounded-lg transition-colors text-(--text-secondary) hover:text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)]" title="Delete">
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
            <p className="font-bold text-sm uppercase tracking-widest text-(--text-secondary)">Loading...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-6 mb-6 border-b border-(--border-primary) pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <a href="/cards/table" className="text-(--text-tertiary) text-xs font-bold uppercase tracking-widest hover:text-(--accent-primary) transition-colors">Cards</a>
              <ChevronRight size={12} className="text-(--text-tertiary)" />
              <span className="text-(--text-secondary) text-xs font-bold uppercase tracking-widest">Purchases</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-(--text-primary) tracking-tight uppercase flex items-center gap-3">
              <CreditCard size={28} style={{ color: 'var(--accent-primary)' }} />
              {card ? `${card.name} •••• ${card.last_four}` : 'Card Purchases'}
            </h2>
            {card && <p className="text-(--text-tertiary) text-xs uppercase font-bold tracking-widest mt-1">{card.bank} · Credit Card</p>}
          </div>
          <button onClick={() => { setEditingPurchase(null); setIsModalOpen(true); }}
            className="group flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-xl transition-all font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 w-full sm:w-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Add Purchase
          </button>
        </div>

        {/* Summary cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-1">Monthly Due</p>
              <p className="text-2xl font-black" style={{ color: 'var(--accent-primary)' }}>${fmt(totalMonthlyDue)}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-1">Active</p>
              <p className="text-2xl font-black text-(--text-primary)">{activePurchases}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-(--text-tertiary) mb-1">Completed</p>
              <p className="text-2xl font-black" style={{ color: 'var(--semantic-success)' }}>{completedPurchases}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col items-center justify-center">
        {data.length > 0 ? (
          <MyTable data={data} columns={columns} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} variant="excel" showPagination={true} />
        ) : (
          <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
            <div className="w-20 h-20 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-(--accent-primary)" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-(--text-primary) uppercase tracking-tight mb-2">No purchases yet</h3>
              <p className="text-(--text-secondary) text-sm mb-6">Add your first credit purchase to start tracking installments.</p>
              <button onClick={() => { setEditingPurchase(null); setIsModalOpen(true); }}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 mx-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)">
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                Add Your First Purchase
              </button>
            </div>
          </div>
        )}
      </div>

      <CardPurchaseModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingPurchase(null); }}
        onSubmit={handleSubmit} isLoading={isSubmitting} initialData={editingPurchase} />
      <DeleteConfirmModal isOpen={purchaseToDelete !== null} onClose={() => setPurchaseToDelete(null)}
        onConfirm={() => purchaseToDelete && handleDelete(purchaseToDelete)} isLoading={isDeleting} />
    </div>
  );
};
