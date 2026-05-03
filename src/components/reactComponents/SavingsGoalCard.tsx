import React, { useCallback, useState } from 'react';
import {
  MoreVertical,
  Plus,
  Calendar,
  TrendingUp,
  Pause,
  Play,
  Trash2,
  Pencil,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { SavingsGoal, GoalContribution } from '../../types/savingsGoalInterfaces';
import AnimatedProgressCircle from './AnimatedProgressCircle';
import { GOAL_ICONS } from './goalIcons';
import { translate, getCurrentLanguage, type Language } from '../../i18n';
import { updateContribution, deleteContribution } from '../../services/savingsGoalServices';
import { toast } from 'sonner';
import { MyCurrencyInput } from '../UIComponents/MyCurrencyInput';
import { MyInput } from '../UIComponents/MyInput';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onContribute: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
  onToggleStatus: (goal: SavingsGoal) => void;
  onRefresh?: () => void;
  compact?: boolean;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onContribute,
  onEdit,
  onDelete,
  onToggleStatus,
  onRefresh,
  compact = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingContribution, setEditingContribution] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const t = useCallback((key: string) => translate(key, lang), [lang]);
  const IconComponent = GOAL_ICONS[goal.icon];

  React.useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: goal.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [goal.currency]);

  const formatDeadline = useCallback((date: string) => {
    const deadline = new Date(date);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return t('savingsGoals.expired') || 'Expired';
    if (diffDays === 0) return t('savingsGoals.today') || 'Today';
    if (diffDays === 1) return t('savingsGoals.tomorrow') || 'Tomorrow';
    if (diffDays <= 30) return `${diffDays} ${t('savingsGoals.days') || 'days'}`;
    if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${t('savingsGoals.month') || 'month'}${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${t('savingsGoals.year') || 'year'}${years > 1 ? 's' : ''}`;
  }, [t]);

  const getStatusBadge = useCallback(() => {
    switch (goal.status) {
      case 'completed':
        return (
          <span
            className="px-2 py-1 text-xs font-semibold rounded-full"
            style={{ backgroundColor: 'var(--semantic-success-rgb, 16 185 129)', color: 'var(--semantic-success, #10B981)' }}
          >
            {t('savingsGoals.completed') || 'Completed'}
          </span>
        );
      case 'paused':
        return (
          <span
            className="px-2 py-1 text-xs font-semibold rounded-full"
            style={{ color: 'var(--semantic-warning, #F59E0B)' }}
          >
            {t('savingsGoals.paused') || 'Paused'}
          </span>
        );
      case 'cancelled':
        return (
          <span
            className="px-2 py-1 text-xs font-semibold rounded-full"
            style={{ color: 'var(--semantic-error, #EF4444)' }}
          >
            {t('savingsGoals.cancelled') || 'Cancelled'}
          </span>
        );
      default:
        return null;
    }
  }, [goal.status, t]);

  const handleMenuToggle = useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setShowMenu(false);
  }, []);

  const handleEditClick = useCallback(() => {
    handleMenuClose();
    onEdit(goal);
  }, [handleMenuClose, onEdit, goal]);

  const handleToggleStatusClick = useCallback(() => {
    handleMenuClose();
    onToggleStatus(goal);
  }, [handleMenuClose, onToggleStatus, goal]);

  const handleDeleteClick = useCallback(() => {
    handleMenuClose();
    onDelete(goal);
  }, [handleMenuClose, onDelete, goal]);

  const handleCardClick = useCallback(() => {
    onContribute(goal);
  }, [onContribute, goal]);

  const startEditContribution = useCallback((contribution: GoalContribution) => {
    setEditingContribution(contribution.uuid);
    setEditAmount(String(contribution.amount));
    setEditNote(contribution.note || '');
  }, []);

  const cancelEditContribution = useCallback(() => {
    setEditingContribution(null);
    setEditAmount('');
    setEditNote('');
  }, []);

  const saveEditContribution = useCallback(async (contributionUuid: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('savingsGoals.invalidAmount') || 'Invalid amount');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await updateContribution(goal.uuid, contributionUuid, {
        amount,
        note: editNote || null,
      });
      if (response.response) {
        toast.success(t('savingsGoals.contributionUpdated') || 'Contribution updated');
        setEditingContribution(null);
        onRefresh?.();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error(t('savingsGoals.errorUpdateContribution') || 'Error updating contribution');
    } finally {
      setIsSubmitting(false);
    }
  }, [editAmount, editNote, goal.uuid, onRefresh, t]);

  const handleDeleteContribution = useCallback((contributionUuid: string) => {
    toast.warning(t('savingsGoals.confirmDeleteContribution') || 'Delete this contribution?', {
      action: {
        label: t('common.delete') || 'Delete',
        onClick: async () => {
          try {
            setIsSubmitting(true);
            const response = await deleteContribution(goal.uuid, contributionUuid);
            if (response.response) {
              toast.success(t('savingsGoals.contributionDeleted') || 'Contribution deleted');
              onRefresh?.();
            } else {
              toast.error(response.message);
            }
          } catch {
            toast.error(t('savingsGoals.errorDeleteContribution') || 'Error deleting contribution');
          } finally {
            setIsSubmitting(false);
          }
        },
      },
      cancel: {
        label: t('common.cancel') || 'Cancel',
        onClick: () => {},
      },
    });
  }, [goal.uuid, onRefresh, t]);

  if (compact) {
    return (
      <div
        className="rounded-xl p-4 transition-all hover:shadow-md cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: `1.5px solid var(--border-primary)`,
        }}
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            {IconComponent && <IconComponent size={20} style={{ color: goal.color }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {goal.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
            </p>
          </div>
          <div className="w-12 h-12">
            <AnimatedProgressCircle
              percentage={goal.progress_percentage}
              size={48}
              strokeWidth={4}
              color={goal.color}
              showPercentage={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6 transition-all hover:shadow-lg relative group"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1.5px solid var(--border-primary)`,
      }}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={handleMenuToggle}
          className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={handleMenuClose}
            />
            <div
              className="absolute right-0 top-10 z-50 py-2 rounded-xl shadow-xl min-w-[160px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1.5px solid var(--border-primary)',
              }}
            >
              <button
                onClick={handleEditClick}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <Pencil size={14} />
                <span className="text-sm">{t('savingsGoals.edit') || 'Edit'}</span>
              </button>
              <button
                onClick={handleToggleStatusClick}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {goal.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                <span className="text-sm">
                  {goal.status === 'paused'
                    ? (t('savingsGoals.resume') || 'Resume')
                    : (t('savingsGoals.pause') || 'Pause')}
                </span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
                style={{ color: 'var(--semantic-error, #EF4444)' }}
              >
                <Trash2 size={14} />
                <span className="text-sm">{t('savingsGoals.delete') || 'Delete'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${goal.color}20` }}
        >
          {IconComponent && <IconComponent size={32} style={{ color: goal.color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="text-base font-bold break-words leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {goal.name}
            </h3>
            {getStatusBadge()}
          </div>
          {goal.linked_card && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {t('savingsGoals.linkedTo') || 'Linked to'} {goal.linked_card.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <AnimatedProgressCircle
          percentage={goal.progress_percentage}
          size={120}
          strokeWidth={10}
          color={goal.color}
        />
      </div>

      <div className="text-center mb-4">
        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {formatCurrency(goal.current_amount)}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {t('savingsGoals.of') || 'of'} {formatCurrency(goal.target_amount)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {goal.formatted_progress.remaining} {t('savingsGoals.remaining') || 'remaining'}
          {goal.progress_percentage >= 100 ? ' ✓' : ''}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        {goal.deadline && (
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={12} />
            <span className="text-xs">
              {formatDeadline(goal.deadline)}
            </span>
          </div>
        )}
        {goal.progress_percentage < 100 && goal.deadline && (
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
            <TrendingUp size={12} />
            <span className="text-xs">
              {formatCurrency(Math.round((goal.target_amount - goal.current_amount) / Math.max(1, goal.days_remaining || 1) * 30) / 1)}/{t('savingsGoals.monthAbbr') || 'mo'}
            </span>
          </div>
        )}
      </div>

      {goal.status === 'active' && (
        <button
          onClick={handleCardClick}
          className="w-full py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] text-sm"
          style={{ backgroundColor: goal.color, color: '#FFFFFF' }}
        >
          <Plus size={16} />
          {t('savingsGoals.contribute') || 'Add Contribution'}
        </button>
      )}

      {goal.contributions && goal.contributions.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHistory((prev) => !prev)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <History size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('savingsGoals.contributionHistory') || 'History'}
              </span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                {goal.contributions.length}
              </span>
            </div>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {goal.contributions.map((contribution) => (
                <div
                  key={contribution.uuid}
                  className="group/item flex items-center justify-between p-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  {editingContribution === contribution.uuid ? (
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-28">
                          <MyCurrencyInput
                            name="editAmount"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <MyInput
                            name="editNote"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder={t('savingsGoals.noteOptional') || 'Note'}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEditContribution(contribution.uuid)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 rounded-lg bg-(--accent-primary) text-(--text-inverted) text-xs font-bold uppercase tracking-wider hover:bg-(--accent-hover) transition-all disabled:opacity-50"
                        >
                          {t('common.save') || 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditContribution}
                          className="px-3 py-1.5 rounded-lg border-2 border-(--text-secondary) text-(--text-primary) text-xs font-bold uppercase tracking-wider hover:border-(--text-primary) hover:bg-(--bg-secondary) transition-all"
                        >
                          {t('common.cancel') || 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(contribution.amount)}
                        </p>
                        {contribution.note && (
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {contribution.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <p className="text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(contribution.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditContribution(contribution)}
                            className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteContribution(contribution.uuid)}
                            className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
                            style={{ color: 'var(--semantic-error)' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavingsGoalCard;