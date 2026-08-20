import { Landmark, Plus } from "lucide-react";

export function FinancingLoadingOverlay({ t }: { t: (key: string) => string }) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-100 flex items-center justify-center">
      <div className="bg-(--bg-surface) p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-t-(--accent-primary) border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        <p className="font-bold text-sm uppercase tracking-widest text-(--text-secondary)">{t("financing.loading")}</p>
      </div>
    </div>
  );
}

export function FinancingEmptyState({ onNewPlan, t }: { onNewPlan: () => void; t: (key: string) => string }) {
  return (
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
        <button onClick={onNewPlan}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-colors transition-transform font-bold text-sm uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:translate-y-0 mx-auto bg-(--accent-primary) text-(--text-inverted) hover:bg-(--accent-hover) hover:shadow-lg">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          {t("financing.createFirst")}
        </button>
      </div>
    </div>
  );
}
