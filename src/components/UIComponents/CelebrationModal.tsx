import React, { useEffect, useState, useCallback } from 'react';
import { PartyPopper } from 'lucide-react';
import type { SavingsGoal } from '@/types/savingsGoalInterfaces';
import { translate, getCurrentLanguage, type Language } from '@/i18n';
import useConfetti from '@/hooks/useConfetti';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, goal }) => {
  const [lang, setLang] = useState<Language>(() => getCurrentLanguage());
  const t = useCallback((key: string) => translate(key, lang), [lang]);
  const { fireConfetti } = useConfetti();

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fireConfetti({
        particleCount: 150,
        spread: 100,
        duration: 4000,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, fireConfetti]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: goal?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [goal?.currency]);

  if (!isOpen || !goal) return null;

  return (
    <>
      <button type="button" aria-label={t('common.close')} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 md:mx-0 transition-opacity duration-300">
        <div
          className="rounded-none shadow-2xl border p-8 text-center relative overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${goal.color}40 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10">
            <div className="mb-4 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center animate-bounce"
                style={{ backgroundColor: `${goal.color}20` }}
              >
                <PartyPopper size={40} style={{ color: goal.color }} />
              </div>
            </div>

            <h2
              className="text-3xl font-semibold mb-2 tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('savingsGoals.congratulations') || 'Congratulations!'}
            </h2>

            <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
              {t('savingsGoals.goalReached') || 'You have reached your goal'}
            </p>

            <p
              className="text-2xl font-bold mb-2"
              style={{ color: goal.color }}
            >
              {goal.name}
            </p>

            <p className="text-4xl font-semibold mb-6" style={{ color: 'var(--semantic-success)' }}>
              {formatCurrency(goal.target_amount)}
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span
                className="px-4 py-2 rounded-none text-sm font-semibold"
                style={{ backgroundColor: 'var(--semantic-success-rgb, 16 185 129)', color: 'var(--semantic-success)' }}
              >
                ✓ {t('savingsGoals.goalCompleted') || 'Goal Completed'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-4 rounded-none font-semibold text-sm transition-opacity active:scale-[0.98]"
              style={{
                backgroundColor: goal.color,
                color: '#FFFFFF',
              }}
            >
              {t('savingsGoals.continue') || 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CelebrationModal;