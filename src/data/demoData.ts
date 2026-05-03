import type { Transaction } from '@/schemas/tableSchema';

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 1, uuid: 'demo-001', date: '2025-05-15', type: 'expense', amount: 150.00, category: 'Groceries', description: 'Weekly grocery shopping', created_at: '2025-05-15', updated_at: '2025-05-15' },
  { id: 2, uuid: 'demo-002', date: '2025-05-14', type: 'income', amount: 2500.00, category: 'Salary', description: 'Monthly salary deposit', created_at: '2025-05-14', updated_at: '2025-05-14' },
  { id: 3, uuid: 'demo-003', date: '2025-05-13', type: 'expense', amount: 45.99, category: 'Transportation', description: 'Gas station fill-up', created_at: '2025-05-13', updated_at: '2025-05-13' },
  { id: 4, uuid: 'demo-004', date: '2025-05-12', type: 'expense', amount: 89.00, category: 'Utilities', description: 'Electric bill payment', created_at: '2025-05-12', updated_at: '2025-05-12' },
  { id: 5, uuid: 'demo-005', date: '2025-05-11', type: 'expense', amount: 32.50, category: 'Dining', description: 'Restaurant dinner', created_at: '2025-05-11', updated_at: '2025-05-11' },
  { id: 6, uuid: 'demo-006', date: '2025-05-10', type: 'income', amount: 200.00, category: 'Freelance', description: 'Side project payment', created_at: '2025-05-10', updated_at: '2025-05-10' },
  { id: 7, uuid: 'demo-007', date: '2025-05-09', type: 'expense', amount: 599.00, category: 'Shopping', description: 'Electronics purchase', created_at: '2025-05-09', updated_at: '2025-05-09' },
  { id: 8, uuid: 'demo-008', date: '2025-05-08', type: 'expense', amount: 15.00, category: 'Entertainment', description: 'Movie tickets', created_at: '2025-05-08', updated_at: '2025-05-08' },
  { id: 9, uuid: 'demo-009', date: '2025-05-07', type: 'expense', amount: 120.00, category: 'Health', description: 'Pharmacy medication', created_at: '2025-05-07', updated_at: '2025-05-07' },
  { id: 10, uuid: 'demo-010', date: '2025-05-06', type: 'expense', amount: 75.00, category: 'Insurance', description: 'Car insurance premium', created_at: '2025-05-06', updated_at: '2025-05-06' },
  { id: 11, uuid: 'demo-011', date: '2025-05-05', type: 'income', amount: 50.00, category: 'Gift', description: 'Birthday gift from friend', created_at: '2025-05-05', updated_at: '2025-05-05' },
  { id: 12, uuid: 'demo-012', date: '2025-05-04', type: 'expense', amount: 250.00, category: 'Rent', description: 'Monthly rent payment', created_at: '2025-05-04', updated_at: '2025-05-04' },
  { id: 13, uuid: 'demo-013', date: '2025-05-03', type: 'expense', amount: 18.99, category: 'Subscriptions', description: 'Streaming service', created_at: '2025-05-03', updated_at: '2025-05-03' },
  { id: 14, uuid: 'demo-014', date: '2025-05-02', type: 'expense', amount: 42.00, category: 'Transportation', description: 'Public transit pass', created_at: '2025-05-02', updated_at: '2025-05-02' },
  { id: 15, uuid: 'demo-015', date: '2025-05-01', type: 'expense', amount: 85.50, category: 'Groceries', description: 'Weekly grocery shopping', created_at: '2025-05-01', updated_at: '2025-05-01' },
];