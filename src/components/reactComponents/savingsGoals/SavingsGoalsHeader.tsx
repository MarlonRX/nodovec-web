import { Plus } from "lucide-react";
import { MySelect } from "@/components/UIComponents/MySelect";
import SplitText from "@/components/reactbits/SplitText";
import ShinyText from "@/components/reactbits/ShinyText";
import SparkButton from "@/components/reactbits/SparkButton";

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
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        <SplitText text={t('savingsGoals.title') || 'Savings Goals'} />
      </h1>
      <ShinyText
        text={`${goalCount} ${goalCount !== 1 ? t('savingsGoals.goals') || 'goals' : t('savingsGoals.goal') || 'goal'}`}
        speed={4}
        className="text-sm mt-1 inline-block"
      />
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

      <SparkButton onClick={onCreateGoal} icon={<Plus size={18} />}>
        {t('savingsGoals.addGoal') || 'Add Goal'}
      </SparkButton>
    </div>
  </div>
);
