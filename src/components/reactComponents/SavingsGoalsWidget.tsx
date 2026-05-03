import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Target } from 'lucide-react';
import { getGoals } from '../../services/savingsGoalServices';
import type { SavingsGoal } from '../../types';
import AnimatedProgressCircle from './AnimatedProgressCircle';
import { translate, getCurrentLanguage, type Language } from '../../i18n';

interface SavingsGoalsWidgetProps {
  maxGoals?: number;
}

const SavingsGoalsWidget: React.FC<SavingsGoalsWidgetProps> = ({ maxGoals = 3 }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = (key: string) => translate(key, lang);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getGoals({ status: 'active', page_size: maxGoals });
      if (response.response) {
        setGoals(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load goals for widget:', err);
    } finally {
      setIsLoading(false);
    }
  }, [maxGoals]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  if (isLoading) {
    return (
      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1.5px solid var(--border-primary)' }}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-[var(--bg-secondary)] rounded" />
          <div className="h-8 bg-[var(--bg-secondary)] rounded" />
          <div className="h-8 bg-[var(--bg-secondary)] rounded" />
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div
        className="rounded-xl p-7 shadow-md transition-all hover:shadow-lg"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1.5px solid var(--border-primary)',
        }}
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.savingsGoals') || 'Savings Goals'}
        </h2>
        <div className="text-center py-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <Target size={24} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.noSavingsGoals') || 'No active savings goals'}
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className="rounded-xl p-5 shadow-md transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--border-primary)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.savingsGoals') || 'Savings Goals'}
        </h2>
        <a
          href="/savings-goals/table"
          className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--accent-primary)' }}
        >
          {t('dashboard.viewAll') || 'Ver todas'}
          <ChevronRight size={16} />
        </a>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.uuid}
            className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
          >
            <AnimatedProgressCircle
              percentage={goal.progress_percentage}
              size={44}
              strokeWidth={4}
              color={goal.color}
              showPercentage={false}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {goal.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
              </p>
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: goal.progress_percentage >= 100 ? '#10B981' : 'var(--text-primary)' }}
            >
              {Math.round(goal.progress_percentage)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavingsGoalsWidget;