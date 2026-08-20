import type { Transaction } from '@/schemas/tableSchema';
import type { SavingsGoal } from '@/types/savingsGoalInterfaces';

export const DEMO_SAVINGS_GOAL: SavingsGoal = {
  uuid: 'demo-goal-001',
  name: 'Fondo de emergencia',
  target_amount: 5000,
  current_amount: 3250,
  currency: 'USD',
  deadline: '2026-12-31',
  linked_card: null,
  icon: 'PiggyBank',
  color: '#10B981',
  priority: 1,
  status: 'active',
  completed_at: null,
  progress_percentage: 65,
  is_completed: false,
  days_remaining: 134,
  formatted_progress: {
    current: '$3,250.00',
    target: '$5,000.00',
    percentage: 65,
    remaining: '$1,750.00',
  },
  created_at: '2026-01-15T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
  contributions: [],
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  // ── Agosto 2026 ─────────────────────────────────────────────
  { id: 1, uuid: 'demo-2026-08-001', date: '2026-08-14', type: 'income', amount: 1200.00, category: 'freelance', description: 'Rediseño de landing page', created_at: '2026-08-14', updated_at: '2026-08-14' },
  { id: 2, uuid: 'demo-2026-08-002', date: '2026-08-12', type: 'expense', amount: 58.40, category: 'transportation', description: 'Combustible', created_at: '2026-08-12', updated_at: '2026-08-12' },
  { id: 3, uuid: 'demo-2026-08-003', date: '2026-08-10', type: 'expense', amount: 145.30, category: 'food', description: 'Mercado semanal', created_at: '2026-08-10', updated_at: '2026-08-10' },
  { id: 4, uuid: 'demo-2026-08-004', date: '2026-08-09', type: 'income', amount: 320.00, category: 'investment', description: 'Dividendos', created_at: '2026-08-09', updated_at: '2026-08-09' },
  { id: 5, uuid: 'demo-2026-08-005', date: '2026-08-07', type: 'expense', amount: 118.00, category: 'utilities', description: 'Electricidad e internet', created_at: '2026-08-07', updated_at: '2026-08-07' },
  { id: 6, uuid: 'demo-2026-08-006', date: '2026-08-05', type: 'expense', amount: 32.99, category: 'entertainment', description: 'Suscripciones de streaming', created_at: '2026-08-05', updated_at: '2026-08-05' },
  { id: 7, uuid: 'demo-2026-08-007', date: '2026-08-03', type: 'expense', amount: 850.00, category: 'rent', description: 'Arriendo de apartamento', created_at: '2026-08-03', updated_at: '2026-08-03' },
  { id: 8, uuid: 'demo-2026-08-008', date: '2026-08-02', type: 'expense', amount: 45.00, category: 'healthcare', description: 'Membresía del gimnasio', created_at: '2026-08-02', updated_at: '2026-08-02' },
  { id: 9, uuid: 'demo-2026-08-009', date: '2026-08-01', type: 'income', amount: 2500.00, category: 'salary', description: 'Retainer mensual — Studio Nova', created_at: '2026-08-01', updated_at: '2026-08-01' },

  // ── Julio 2026 ──────────────────────────────────────────────
  { id: 10, uuid: 'demo-2026-07-001', date: '2026-07-25', type: 'income', amount: 500.00, category: 'bonus', description: 'Bono por referido', created_at: '2026-07-25', updated_at: '2026-07-25' },
  { id: 11, uuid: 'demo-2026-07-002', date: '2026-07-20', type: 'income', amount: 1800.00, category: 'freelance', description: 'MVP de app móvil', created_at: '2026-07-20', updated_at: '2026-07-20' },
  { id: 12, uuid: 'demo-2026-07-003', date: '2026-07-18', type: 'expense', amount: 89.99, category: 'shopping', description: 'Accesorios de escritorio', created_at: '2026-07-18', updated_at: '2026-07-18' },
  { id: 13, uuid: 'demo-2026-07-004', date: '2026-07-11', type: 'expense', amount: 132.75, category: 'food', description: 'Mercado semanal', created_at: '2026-07-11', updated_at: '2026-07-11' },
  { id: 14, uuid: 'demo-2026-07-005', date: '2026-07-06', type: 'expense', amount: 115.00, category: 'utilities', description: 'Electricidad e internet', created_at: '2026-07-06', updated_at: '2026-07-06' },
  { id: 15, uuid: 'demo-2026-07-006', date: '2026-07-03', type: 'expense', amount: 850.00, category: 'rent', description: 'Arriendo de apartamento', created_at: '2026-07-03', updated_at: '2026-07-03' },
  { id: 16, uuid: 'demo-2026-07-007', date: '2026-07-01', type: 'income', amount: 2500.00, category: 'salary', description: 'Retainer mensual', created_at: '2026-07-01', updated_at: '2026-07-01' },

  // ── Junio 2026 ──────────────────────────────────────────────
  { id: 17, uuid: 'demo-2026-06-001', date: '2026-06-22', type: 'income', amount: 2200.00, category: 'freelance', description: 'Tienda e-commerce', created_at: '2026-06-22', updated_at: '2026-06-22' },
  { id: 18, uuid: 'demo-2026-06-002', date: '2026-06-20', type: 'expense', amount: 28.50, category: 'entertainment', description: 'Cine y cena', created_at: '2026-06-20', updated_at: '2026-06-20' },
  { id: 19, uuid: 'demo-2026-06-003', date: '2026-06-15', type: 'expense', amount: 62.00, category: 'transportation', description: 'Combustible', created_at: '2026-06-15', updated_at: '2026-06-15' },
  { id: 20, uuid: 'demo-2026-06-004', date: '2026-06-12', type: 'expense', amount: 127.40, category: 'food', description: 'Mercado semanal', created_at: '2026-06-12', updated_at: '2026-06-12' },
  { id: 21, uuid: 'demo-2026-06-005', date: '2026-06-03', type: 'expense', amount: 850.00, category: 'rent', description: 'Arriendo de apartamento', created_at: '2026-06-03', updated_at: '2026-06-03' },
  { id: 22, uuid: 'demo-2026-06-006', date: '2026-06-01', type: 'income', amount: 2500.00, category: 'salary', description: 'Retainer mensual', created_at: '2026-06-01', updated_at: '2026-06-01' },
];
