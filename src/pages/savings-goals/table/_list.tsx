import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Target } from 'lucide-react';
import { toast } from 'sonner';
import SavingsGoalCard from '../../../components/reactComponents/SavingsGoalCard';
import { ContributionModal } from '../../../components/UIComponents/ContributionModal';
import { SavingsGoalModal } from '../../../components/UIComponents/SavingsGoalModal';
import { DeleteConfirmModal } from '../../../components/UIComponents/DeleteConfirmModal';
import CelebrationModal from '../../../components/UIComponents/CelebrationModal';
import {
  getGoals,
  updateGoal,
  deleteGoal,
  createGoal,
  contributeToGoal,
} from '../../../services/savingsGoalServices';
import type { SavingsGoal } from '../../../types';
import { translate, getCurrentLanguage, type Language } from '../../../i18n';

const SavingsGoalsTable: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState<SavingsGoal | null>(null);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getGoals({ status: filterStatus === 'all' ? undefined : filterStatus });
      if (response.response) {
        setGoals(response.data.data);
      } else {
        setError(response.message);
      }
    } catch {
      setError(t('savingsGoals.errorLoad') || 'Failed to load savings goals');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, t]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleDeleteGoal = useCallback((goal: SavingsGoal) => {
    setDeleteConfirmGoal(goal);
  }, []);

  const handleConfirmDeleteGoal = useCallback(async () => {
    if (!deleteConfirmGoal) return;
    try {
      setIsDeletingGoal(true);
      const response = await deleteGoal(deleteConfirmGoal.uuid);
      if (response.response) {
        toast.success(t('savingsGoals.deleted') || 'Goal deleted');
        setDeleteConfirmGoal(null);
        loadGoals();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error(t('savingsGoals.errorDelete') || 'Error deleting goal');
    } finally {
      setIsDeletingGoal(false);
    }
  }, [deleteConfirmGoal, loadGoals, t]);

  const handleToggleStatus = useCallback(async (goal: SavingsGoal) => {
    const newStatus = goal.status === 'paused' ? 'active' : 'paused';
    try {
      const response = await updateGoal(goal.uuid, { status: newStatus } as any);
      if (response.response) {
        toast.success(newStatus === 'paused'
          ? (t('savingsGoals.paused') || 'Goal paused')
          : (t('savingsGoals.resumed') || 'Goal resumed'));
        loadGoals();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error(t('savingsGoals.errorStatus') || 'Error changing status');
    }
  }, [loadGoals, t]);

  const handleContribute = useCallback(async (amount: number, note?: string) => {
    if (!selectedGoal) return;
    try {
      setIsSubmitting(true);
      const response = await contributeToGoal(selectedGoal.uuid, { amount, note });
      if (response.response) {
        toast.success(t('savingsGoals.contributionAdded') || 'Contribution added');
        setIsContributeModalOpen(false);
        setSelectedGoal(null);

        if (response.data.just_completed) {
          setIsCelebrationModalOpen(true);
        }

        loadGoals();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error(t('savingsGoals.errorContribute') || 'Error adding contribution');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedGoal, loadGoals, t]);

  const openContributeModal = useCallback((goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsContributeModalOpen(true);
  }, []);

  const openEditModal = useCallback((goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  }, []);

  const closeContributeModal = useCallback(() => {
    setIsContributeModalOpen(false);
    setSelectedGoal(null);
  }, []);

  const closeCelebrationModal = useCallback(() => {
    setIsCelebrationModalOpen(false);
    setSelectedGoal(null);
  }, []);

  const closeGoalModal = useCallback(() => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  }, []);

  const handleCreateOrUpdate = useCallback(async (goalData: Partial<SavingsGoal>) => {
    try {
      setIsSubmitting(true);
      if (editingGoal?.uuid) {
        const response = await updateGoal(editingGoal.uuid, goalData as any);
        if (response.response) {
          toast.success(t('savingsGoals.updated') || 'Goal updated');
          closeGoalModal();
          loadGoals();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await createGoal(goalData as any);
        if (response.response) {
          toast.success(t('savingsGoals.created') || 'Goal created');
          closeGoalModal();
          loadGoals();
        } else {
          toast.error(response.message);
        }
      }
    } catch {
      toast.error(t('savingsGoals.errorSave') || 'Error saving goal');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingGoal, closeGoalModal, loadGoals, t]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value as 'all' | 'active' | 'completed');
  }, []);

  const getEmptyStateMessage = () => {
    if (filterStatus === 'completed') {
      return {
        title: t('savingsGoals.noCompletedGoals') || 'No completed goals',
        description: t('savingsGoals.noCompletedGoalsHint') || 'Complete a goal to see it here',
      };
    }
    return {
      title: t('savingsGoals.noGoals') || 'No savings goals',
      description: t('savingsGoals.noGoalsHint') || 'Create your first savings goal to start',
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-12 h-12 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: 'var(--accent-primary)',
            borderRightColor: 'var(--accent-primary)',
          }}
        />
      </div>
    );
  }

  const emptyState = getEmptyStateMessage();

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-black tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('savingsGoals.title') || 'Savings Goals'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {goals.length} {goals.length !== 1 ? t('savingsGoals.goals') || 'goals' : t('savingsGoals.goal') || 'goal'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1.5px solid var(--border-primary)' }}
          >
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            >
              <option value="all">{t('savingsGoals.filterAll') || 'All'}</option>
              <option value="active">{t('savingsGoals.filterActive') || 'Active'}</option>
              <option value="completed">{t('savingsGoals.filterCompleted') || 'Completed'}</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverted)' }}
          >
            <Plus size={18} />
            {t('savingsGoals.addGoal') || 'Add Goal'}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: 'var(--semantic-error-rgb, 239 68 68)', color: 'var(--semantic-error)' }}
        >
          {error}
        </div>
      )}

      {goals.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1.5px solid var(--border-primary)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <Target size={32} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {emptyState.title}
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {emptyState.description}
          </p>
          {filterStatus !== 'completed' && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverted)' }}
            >
              <Plus size={18} />
              {t('savingsGoals.addFirstGoal') || 'Add Your First Goal'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.uuid}
              goal={goal}
              onContribute={openContributeModal}
              onEdit={openEditModal}
              onDelete={handleDeleteGoal}
              onToggleStatus={handleToggleStatus}
              onRefresh={loadGoals}
            />
          ))}
        </div>
      )}

      <ContributionModal
        isOpen={isContributeModalOpen}
        onClose={closeContributeModal}
        onSubmit={handleContribute}
        isLoading={isSubmitting}
        goal={selectedGoal}
      />

      <CelebrationModal
        isOpen={isCelebrationModalOpen}
        onClose={closeCelebrationModal}
        goal={selectedGoal}
      />

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={closeGoalModal}
        onSubmit={handleCreateOrUpdate}
        isLoading={isSubmitting}
        initialData={editingGoal}
      />

      <DeleteConfirmModal
        isOpen={!!deleteConfirmGoal}
        onClose={() => setDeleteConfirmGoal(null)}
        onConfirm={handleConfirmDeleteGoal}
        title={t('savingsGoals.confirmDeleteTitle') || 'Delete Goal?'}
        description={t('savingsGoals.confirmDeleteDescription')?.replace('${name}', deleteConfirmGoal?.name || '') || `This will permanently delete "${deleteConfirmGoal?.name || ''}" and all its contributions. This action cannot be undone.`}
        isLoading={isDeletingGoal}
      />
    </div>
  );
};

export default SavingsGoalsTable;