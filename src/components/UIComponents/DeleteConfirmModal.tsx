import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { translate, getCurrentLanguage, type Language } from "@/i18n";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: DeleteConfirmModalProps) => {
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener("languageChanged", onLang);
    return () => window.removeEventListener("languageChanged", onLang);
  }, []);

  if (!isOpen) return null;

  const finalTitle = title ?? t("delete.deleteTransactionTitle");
  const finalDescription = description ?? t("delete.deleteTransactionDescription");

  return (
    <>
      <button
        type="button"
        aria-label={t('common.close')}
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg duration-300">
        <div className="bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-primary) p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-(--text-primary) tracking-tight uppercase">
              {finalTitle}
            </h2>
            <button
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors group"
            >
              <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <p className="text-(--text-secondary) font-medium italic mb-8">
            {finalDescription}
          </p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-(--bg-surface) border-2 border-(--text-secondary) text-(--text-primary) rounded-lg hover:border-(--text-primary) hover:bg-(--bg-secondary) transition-colors font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("delete.cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-(--accent-primary) text-(--text-inverted) rounded-lg hover:bg-(--accent-hover) transition-colors transition-transform font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? t("delete.deleting") : t("delete.confirm")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
