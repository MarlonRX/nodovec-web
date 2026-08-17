import { z } from 'zod';

export const WidgetTypeSchema = z.enum([
  'metric-cards',
  'financial-overview',
  'expense-categories',
  'account-balances',
  'recent-transactions',
  'budget-progress',
  'savings-goals',
  'card-summary',
]);

export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const WidgetConfigSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  visible: z.boolean().default(true),
  order: z.number(),
});

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

const DashboardLayoutSchema = z.object({
  version: z.number().default(1),
  widgets: z.array(WidgetConfigSchema),
  preset: z.string().optional(),
});

export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'metric-cards', type: 'metric-cards', visible: true, order: 0 },
  { id: 'financial-overview', type: 'financial-overview', visible: true, order: 1 },
  { id: 'expense-categories', type: 'expense-categories', visible: true, order: 2 },
  { id: 'account-balances', type: 'account-balances', visible: true, order: 3 },
  { id: 'recent-transactions', type: 'recent-transactions', visible: true, order: 4 },
];

export const DASHBOARD_PRESETS: Record<string, WidgetConfig[]> = {
  default: DEFAULT_WIDGETS,
  minimal: [
    { id: 'metric-cards', type: 'metric-cards', visible: true, order: 0 },
    { id: 'recent-transactions', type: 'recent-transactions', visible: true, order: 1 },
  ],
  analytics: [
    { id: 'metric-cards', type: 'metric-cards', visible: true, order: 0 },
    { id: 'financial-overview', type: 'financial-overview', visible: true, order: 1 },
    { id: 'expense-categories', type: 'expense-categories', visible: true, order: 2 },
    { id: 'account-balances', type: 'account-balances', visible: true, order: 3 },
  ],
};