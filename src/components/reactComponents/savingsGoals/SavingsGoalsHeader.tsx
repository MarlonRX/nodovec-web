import { Plus } from "lucide-react";
import { MySelect } from "@/components/UIComponents/MySelect";

interface SavingsGoalsHeaderProps {
  goalCount: number;
  filterStatus: 'all' | 'active' | 'completed';
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCreateGoal: () => void;
  t: (key: string) => string;
}

export const SavingsGoalsHeader = ({
  goalCount,
  filterStatus,
  onFilterChange,
  onCreateGoal,
  t,
}: SavingsGoalsHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {t('savingsGoals.title') || 'Savings Goals'}
      </h1>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        {goalCount} {goalCount !== 1 ? t('savingsGoals.goals') || 'goals' : t('savingsGoals.goal') || 'goal'}
      </p>
    </div>

    <div className="flex items-center gap-3">
      <MySelect
        value={filterStatus}
        onChange={onFilterChange}
        aria-label="Filter by status"
        className="w-36"
        options={[
          { value: "all", label: t('savingsGoals.filterAll') || 'All' },
          { value: "active", label: t('savingsGoals.filterActive') || 'Active' },
          { value: "completed", label: t('savingsGoals.filterCompleted') || 'Completed' },
        ]}
      />

      <button
        onClick={onCreateGoal}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverted)' }}
      >
        <Plus size={18} />
        {t('savingsGoals.addGoal') || 'Add Goal'}
      </button>
    </div>
  </div>
);
