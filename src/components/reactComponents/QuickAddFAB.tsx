import { useState, useCallback, useEffect } from 'react';
import { Plus, Zap } from 'lucide-react';
import { useGlobalShortcut } from '@/hooks/useGlobalShortcut';
import { TransactionModal } from '@/components/UIComponents/TransactionModal';
import { createTransaction } from '@/services/transactionServices';
import { toast } from 'sonner';
import { translate, getCurrentLanguage, type Language } from '@/i18n';

const RECENT_CATEGORIES_KEY = 'nodovec_recent_categories';
const MAX_RECENT = 5;

function getRecentCategories(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentCategory(category: string) {
  try {
    const recent = getRecentCategories();
    const updated = [category, ...recent.filter((c) => c !== category)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Floating Action Button with global shortcut for quick transaction creation.
 */
export function QuickAddFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const openModal = useCallback(() => setIsOpen(true), []);
  useGlobalShortcut('n', openModal);

  const handleSubmit = async (transactionData: any) => {
    setIsSubmitting(true);
    try {
      const result = await createTransaction(transactionData);
      if (result.response) {
        toast.success(t('transactions.created') || 'Transaction created');
        if (transactionData.category) {
          saveRecentCategory(transactionData.category);
        }
        setIsOpen(false);
        // Trigger a refresh event so tables reload
        window.dispatchEvent(new CustomEvent('transactionCreated'));
      } else {
        toast.error(result.message || t('transactions.errorCreate') || 'Error creating transaction');
      }
    } catch (err: any) {
      toast.error(err?.message || t('common.unexpectedError') || 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={openModal}
        title={`${t('transactions.quickAdd') || 'Quick Add'} (Ctrl/Cmd + N)`}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-(--accent-primary) text-(--text-inverted) shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        aria-label={t('transactions.quickAdd') || 'Quick Add Transaction'}
      >
        <Plus className="w-7 h-7 transition-transform group-hover:rotate-90" />
      </button>

      {/* Keyboard shortcut hint (visible on hover) */}
      <div className="fixed bottom-24 right-6 z-50 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="px-2 py-1 rounded-md bg-(--bg-secondary) text-(--text-secondary) text-xs font-bold border border-(--border-primary) shadow-sm">
          Ctrl/Cmd + N
        </span>
      </div>

      {/* Quick Add Modal */}
      <TransactionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </>
  );
}
