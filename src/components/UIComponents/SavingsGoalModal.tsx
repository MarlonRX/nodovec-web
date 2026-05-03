import { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { MyInput } from './MyInput';
import { MyDatePicker } from './MyDatePicker';
import { MyCurrencyInput } from './MyCurrencyInput';
import { MySelect } from './MySelect';
import {
  type SavingsGoal,
  type SavingsGoalIcon,
  type SavingsGoalColor,
  SAVINGS_GOAL_COLORS,
  GOAL_ICON_LABELS,
} from '@/types/savingsGoalInterfaces';
import { GOAL_ICONS, GOAL_ICON_LIST } from '@/components/reactComponents/goalIcons';
import type { Card } from '@/types/dashboardInterfaces';
import { getAllCards } from '@/services/cardServices';
import { translate, getCurrentLanguage, type Language } from '@/i18n';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Partial<SavingsGoal>) => Promise<void>;
  isLoading?: boolean;
  initialData?: SavingsGoal | null;
}

const initialFormData = {
  name: '',
  target_amount: '',
  currency: 'USD',
  deadline: '',
  linked_card_id: '',
  icon: 'Target' as SavingsGoalIcon,
  color: '#3B82F6' as SavingsGoalColor,
  priority: '0',
};

export const SavingsGoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}: SavingsGoalModalProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [lang, setLang] = useState<Language>(getCurrentLanguage());
  const [formData, setFormData] = useState(initialFormData);
  const t = useCallback((key: string) => translate(key, lang), [lang]);

  useEffect(() => {
    const onLang = (e: Event) => setLang((e as CustomEvent).detail as Language);
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const response = await getAllCards();
        if (response.response) {
          setCards(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load cards:', err);
      }
    };
    if (isOpen) {
      loadCards();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          target_amount: String(initialData.target_amount || ''),
          currency: initialData.currency || 'USD',
          deadline: initialData.deadline || '',
          linked_card_id: initialData.linked_card?.uuid || '',
          icon: initialData.icon || 'Target',
          color: initialData.color || '#3B82F6',
          priority: String(initialData.priority || 0),
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, initialData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCurrencyInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, target_amount: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      currency: formData.currency,
      deadline: formData.deadline || null,
      linked_card_id: formData.linked_card_id || null,
      icon: formData.icon,
      color: formData.color,
      priority: parseInt(formData.priority) || 0,
    };

    if (initialData?.uuid) {
      payload.uuid = initialData.uuid;
    }

    await onSubmit(payload);
  }, [formData, initialData, onSubmit]);

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    onClose();
  }, [onClose]);

  const handleIconSelect = useCallback((icon: SavingsGoalIcon) => {
    setFormData((prev) => ({ ...prev, icon }));
  }, []);

  const handleColorSelect = useCallback((color: SavingsGoalColor) => {
    setFormData((prev) => ({ ...prev, color }));
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 md:mx-0 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-(--bg-surface) rounded-2xl shadow-2xl border border-(--border-primary) p-4 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-(--text-primary) tracking-tight uppercase">
                {initialData ? (t('savingsGoals.editGoal') || 'Edit Goal') : (t('savingsGoals.newGoal') || 'New Savings Goal')}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-(--bg-hover) rounded-full transition-colors group"
            >
              <X className="w-6 h-6 text-(--text-secondary) group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <div className="col-span-1 md:col-span-2">
              <MyInput
                label={t('savingsGoals.nameLabel') || 'Goal Name'}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('savingsGoals.namePlaceholder') || 'e.g., Trip to Japan'}
                required
              />
            </div>

            <div className="col-span-1">
              <MyCurrencyInput
                label={t('savingsGoals.targetAmount') || 'Target Amount'}
                name="target_amount"
                value={formData.target_amount}
                onChange={handleCurrencyInputChange}
                required
              />
            </div>

            <div className="col-span-1">
              <MyDatePicker
                label={t('savingsGoals.deadlineOptional') || 'Deadline (optional)'}
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-1">
              <MySelect
                label={t('savingsGoals.linkedCard') || 'Linked Card (optional)'}
                name="linked_card_id"
                value={formData.linked_card_id}
                onChange={handleChange}
                options={[
                  { value: '', label: t('savingsGoals.noLinkedCard') || 'Not linked' },
                  ...cards.map((card) => ({
                    value: card.uuid,
                    label: `${card.name} (${card.last_four})`,
                  })),
                ]}
              />
            </div>

            <div className="col-span-1">
              <MySelect
                label={t('savingsGoals.priorityLabel') || 'Priority'}
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: '0', label: t('savingsGoals.priorityLow') || 'Low' },
                  { value: '5', label: t('savingsGoals.priorityMedium') || 'Medium' },
                  { value: '10', label: t('savingsGoals.priorityHigh') || 'High' },
                ]}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('savingsGoals.iconLabel') || 'Icon'}
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICON_LIST.map((iconName) => {
                  const Icon = GOAL_ICONS[iconName];
                  const isSelected = formData.icon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleIconSelect(iconName)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: isSelected ? `${formData.color}30` : 'var(--bg-secondary)',
                        border: `2px solid ${isSelected ? formData.color : 'transparent'}`,
                      }}
                      title={GOAL_ICON_LABELS[iconName]}
                    >
                      {Icon && (
                        <Icon
                          size={24}
                          style={{ color: isSelected ? formData.color : 'var(--text-secondary)' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('savingsGoals.colorLabel') || 'Color'}
              </label>
              <div className="flex flex-wrap gap-2">
                {SAVINGS_GOAL_COLORS.map((color) => {
                  const isSelected = formData.color === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: color,
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: isSelected ? `0 0 0 3px var(--bg-surface), 0 0 0 5px ${color}` : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 md:pt-6 col-span-1 md:col-span-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 md:py-3 bg-(--bg-surface) border-2 border-(--text-secondary) text-(--text-primary) rounded-lg hover:border-(--text-primary) hover:bg-(--bg-secondary) transition-all font-bold uppercase tracking-wider text-sm md:text-base"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 md:py-3 text-white rounded-lg hover:opacity-90 transition-all font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 text-sm md:text-base"
                style={{ backgroundColor: formData.color }}
              >
                {isLoading
                  ? (t('common.saving') || 'Saving...')
                  : initialData
                    ? (t('savingsGoals.updateGoal') || 'Update Goal')
                    : (t('savingsGoals.createGoal') || 'Create Goal')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};