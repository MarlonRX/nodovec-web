import { describe, expect, it } from 'vitest';
import { TransactionSchema } from './tableSchema';

const transaction = {
  id: 1,
  uuid: 'transaction-uuid',
  date: '2026-08-03',
  type: 'expense' as const,
  amount: 10,
  category: 'Food',
  description: null,
  created_at: '2026-08-03T00:00:00.000000Z',
  updated_at: '2026-08-03T00:00:00.000000Z',
};

describe('TransactionSchema', () => {
  it('normalizes numeric is_fixed values from the API', () => {
    expect(TransactionSchema.parse({ ...transaction, is_fixed: 1 }).is_fixed).toBe(true);
    expect(TransactionSchema.parse({ ...transaction, is_fixed: 0 }).is_fixed).toBe(false);
  });
});
