import { CreditCard, Plus } from "lucide-react";

interface CardsEmptyStateProps {
  onAdd: () => void;
  t: (key: string) => string;
}

export function CardsEmptyState({ onAdd, t }: CardsEmptyStateProps) {
  return (
    <div className="text-center flex flex-col items-center justify-center gap-6 py-12 px-6">
      <div className="w-20 h-20 bg-[rgba(212,175,55,0.1)] rounded-full flex items-center justify-center">
        <CreditCard className="w-10 h-10 text-(--accent-primary)" />
      </div>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-(--text-primary) uppercase tracking-tight mb-2">{t('cards.noCards')}</h3>
        <p className="text-(--text-secondary) text-sm mb-6">{t('cards.noCardsHint')}</p>
        <button onClick={onAdd}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-colors transition-transform font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 mx-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover)">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          {t('cards.addFirstCard')}
        </button>
      </div>
    </div>
  );
}
