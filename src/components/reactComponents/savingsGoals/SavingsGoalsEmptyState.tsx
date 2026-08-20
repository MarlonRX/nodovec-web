import { Plus, Target } from "lucide-react";

interface SavingsGoalsEmptyStateProps {
  filterStatus: 'all' | 'active' | 'completed';
  onCreateGoal: () => void;
  t: (key: string) => string;
}

export const SavingsGoalsEmptyState = ({ filterStatus, onCreateGoal, t }: SavingsGoalsEmptyStateProps) => {
  const emptyState = filterStatus === 'completed'
    ? { title: t('savingsGoals.noCompletedGoals') || 'No completed goals', description: t('savingsGoals.noCompletedGoalsHint') || 'Complete a goal to see it here' }
    : { title: t('savingsGoals.noGoals') || 'No savings goals', description: t('savingsGoals.noGoalsHint') || 'Create your first savings goal to start' };

  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1.5px solid var(--border-primary)' }}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <Target size={32} style={{ color: 'var(--text-secondary)' }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{emptyState.title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{emptyState.description}</p>
      {filterStatus !== 'completed' && (
        <button
          onClick={onCreateGoal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverted)' }}
        >
          <Plus size={18} />
          {t('savingsGoals.addFirstGoal') || 'Add Your First Goal'}
        </button>
      )}
    </div>
  );
};
