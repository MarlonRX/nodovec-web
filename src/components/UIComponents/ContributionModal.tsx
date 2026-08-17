import { useState, useEffect, useCallback } from 'react';
import { X, TrendingUp, History } from 'lucide-react';
import { MyCurrencyInput } from './MyCurrencyInput';
import { MyTextArea } from './MyTextArea';
import type { SavingsGoal } from '@/types/savingsGoalInterfaces';
import AnimatedProgressCircle from '../reactComponents/AnimatedProgressCircle';
import { translate, getCurrentLanguage, type Language } from '@/i18n';
import { formatDateShort } from '@/utils/dateFormat';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, note?: string) => Promise<void>;
  isLoading?: boolean;
  goal: SavingsGoal | null;
}

const initialFormData = {
  amount: '',
  note: '',
};

export const ContributionModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  goal,
}: ContributionModalProps) => {
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const [formData, setFormData] = useState(initialFormData);
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen]);

  const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, amount: e.target.value }));
  }, []);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    await onSubmit(parseFloat(formData.amount), formData.note || undefined);
  }, [goal, formData.amount, formData.note, onSubmit]);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    onClose();
  }, [onClose]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: goal?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [goal?.currency]);

  if (!isOpen || !goal) return null;

  const amountValue = parseFloat(formData.amount) || 0;
  const newProgress = goal.target_amount > 0
    ? Math.min(((goal.current_amount + amountValue) / goal.target_amount) * 100, 100)
    : 0;
  const willComplete = goal.current_amount < goal.target_amount &&
    (goal.current_amount + amountValue) >= goal.target_amount;

  return (
    <>
      <button type="button" aria-label={t('common.close')} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 md:mx-0 max-h-[90vh] overflow-y-auto duration-300">
        <div
          className="rounded-2xl shadow-2xl border p-6 md:p-8"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} style={{ color: goal.color }} />
              <h2
                className="text-xl font-black tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('savingsGoals.contributeTitle') || 'Add Contribution'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              aria-label={t('common.close')}
              className="p-2 rounded-full transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6 text-center">
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {goal.name}
            </p>
            <div className="flex justify-center mb-2">
              <AnimatedProgressCircle
                percentage={newProgress}
                size={100}
                strokeWidth={8}
                color={goal.color}
              />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {formatCurrency(goal.current_amount + amountValue)} {t('savingsGoals.of') || 'of'} {formatCurrency(goal.target_amount)}
            </p>
            {willComplete && (
              <p className="text-sm font-semibold mt-2" style={{ color: 'var(--semantic-success)' }}>
                {t('savingsGoals.willComplete') || "You'll complete your goal!"}
              </p>
            )}
            {!willComplete && (
              <p className="text-base font-semibold mt-3" style={{ color: 'var(--text-secondary)' }}>
                {t('savingsGoals.remainingInitial')?.replace('${amount}', formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))) || 
                 `${formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))} remaining to reach your goal`}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <MyCurrencyInput
              label={t('savingsGoals.amountToAdd') || 'Amount to add'}
              name="amount"
              value={formData.amount}
              onChange={handleCurrencyChange}
              placeholder="0.00"
              required
            />

            <MyTextArea
              label={t('savingsGoals.noteOptional') || 'Note (optional)'}
              name="note"
              value={formData.note}
              onChange={handleNoteChange}
              placeholder={t('savingsGoals.notePlaceholder') || 'e.g., Monthly contribution'}
              rows={2}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-lg border-2 transition-colors font-bold uppercase tracking-wider text-sm"
                style={{
                  borderColor: 'var(--text-secondary)',
                  color: 'var(--text-primary)',
                }}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading || amountValue <= 0}
                className="flex-1 px-4 py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-lg disabled:opacity-50 transition-opacity"
                style={{
                  backgroundColor: goal.color,
                  color: '#FFFFFF',
                }}
              >
                {isLoading
                  ? (t('common.saving') || 'Saving...')
                  : (t('savingsGoals.add') || 'Add')}
              </button>
            </div>
          </form>

          {goal.contributions && goal.contributions.length > 0 && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center gap-2 mb-4">
                <History size={18} style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  {t('savingsGoals.contributionHistory') || 'Contribution History'}
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  {goal.contributions.length}
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {goal.contributions.map((contribution) => (
                  <div
                    key={contribution.uuid}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(contribution.amount)}
                      </p>
                      {contribution.note && (
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {contribution.note}
                        </p>
                      )}
                    </div>
                    <p className="text-xs whitespace-nowrap ml-3" style={{ color: 'var(--text-secondary)' }}>
                      {formatDateShort(contribution.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContributionModal;