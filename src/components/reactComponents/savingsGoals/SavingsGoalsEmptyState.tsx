import { Plus, Target } from "lucide-react";
import SparkButton from "@/components/reactbits/SparkButton";

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
      className="glass-panel animate-fade-up rounded-none p-12 text-center"
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)' }}>
        <Target size={32} style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{emptyState.title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{emptyState.description}</p>
      {filterStatus !== 'completed' && (
        <SparkButton onClick={onCreateGoal} icon={<Plus size={18} />} wrapperClassName="w-auto mx-auto" className="px-6 py-3 text-sm">
          {t('savingsGoals.addFirstGoal') || 'Add Your First Goal'}
        </SparkButton>
      )}
    </div>
  );
};
