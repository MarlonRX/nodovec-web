import { z } from 'zod';

export const SavingsGoalIconSchema = z.enum([
  'Target',
  'PiggyBank',
  'Plane',
  'Car',
  'Home',
  'Laptop',
  'Gift',
  'Heart',
  'Star',
  'Wallet',
]);

export const SavingsGoalColorSchema = z.enum([
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
]);

export const SavingsGoalStatusSchema = z.enum(['active', 'completed', 'paused', 'cancelled']);

export const LinkedCardSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  type: z.enum(['credit', 'debit']),
});

export const GoalContributionSchema = z.object({
  uuid: z.string(),
  amount: z.number(),
  note: z.string().nullable(),
  created_at: z.string(),
});

export const FormattedProgressSchema = z.object({
  current: z.string(),
  target: z.string(),
  percentage: z.number(),
  remaining: z.string(),
});

export const SavingsGoalSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  target_amount: z.number(),
  current_amount: z.number(),
  currency: z.string(),
  deadline: z.string().nullable(),
  linked_card: LinkedCardSchema.nullable(),
  icon: SavingsGoalIconSchema,
  color: SavingsGoalColorSchema,
  priority: z.number(),
  status: SavingsGoalStatusSchema,
  completed_at: z.string().nullable(),
  progress_percentage: z.number(),
  is_completed: z.boolean(),
  days_remaining: z.number().nullable(),
  formatted_progress: FormattedProgressSchema,
  created_at: z.string(),
  updated_at: z.string(),
  contributions: z.array(GoalContributionSchema),
});

export const CreateSavingsGoalSchema = z.object({
  name: z.string().min(1).max(100),
  target_amount: z.number().positive(),
  currency: z.string().length(3).optional().default('USD'),
  deadline: z.string().nullable().optional(),
  linked_card_id: z.string().uuid().nullable().optional(),
  icon: SavingsGoalIconSchema.optional().default('Target'),
  color: SavingsGoalColorSchema.optional().default('#3B82F6'),
  priority: z.number().int().min(0).max(10).optional().default(0),
});

export const UpdateSavingsGoalSchema = CreateSavingsGoalSchema.partial().extend({
  status: SavingsGoalStatusSchema.optional(),
});

export const ContributeToGoalSchema = z.object({
  amount: z.number().positive(),
  note: z.string().max(500).nullable().optional(),
});

export type SavingsGoalIcon = z.infer<typeof SavingsGoalIconSchema>;
export type SavingsGoalColor = z.infer<typeof SavingsGoalColorSchema>;
export type SavingsGoalStatus = z.infer<typeof SavingsGoalStatusSchema>;
export type LinkedCard = z.infer<typeof LinkedCardSchema>;
export type GoalContribution = z.infer<typeof GoalContributionSchema>;
export type FormattedProgress = z.infer<typeof FormattedProgressSchema>;
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;
export type CreateSavingsGoal = z.infer<typeof CreateSavingsGoalSchema>;
export type UpdateSavingsGoal = z.infer<typeof UpdateSavingsGoalSchema>;
export type ContributeToGoal = z.infer<typeof ContributeToGoalSchema>;

export const SAVINGS_GOAL_ICONS: SavingsGoalIcon[] = [
  'Target',
  'PiggyBank',
  'Plane',
  'Car',
  'Home',
  'Laptop',
  'Gift',
  'Heart',
  'Star',
  'Wallet',
];

export const SAVINGS_GOAL_COLORS: SavingsGoalColor[] = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
];

export const GOAL_ICON_LABELS: Record<SavingsGoalIcon, string> = {
  Target: 'Objetivo',
  PiggyBank: 'Ahorrar',
  Plane: 'Viaje',
  Car: 'Auto',
  Home: 'Casa',
  Laptop: 'Tecnología',
  Gift: 'Regalo',
  Heart: 'Salud',
  Star: 'Sueños',
  Wallet: 'Finanzas',
};