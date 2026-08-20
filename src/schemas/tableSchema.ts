import { z } from 'zod';

// Column configuration schema - generic for any table
export const ColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  sortable: z.boolean().optional().default(true),
  render: z.function().optional(),
});

export type Column = z.infer<typeof ColumnSchema>;

// Table configuration schema
const TableConfigSchema = z.object({
  columns: z.array(ColumnSchema),
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  data: z.array(z.looseObject({ id: z.union([z.string(), z.number()]) })),

});

export type TableConfig = z.infer<typeof TableConfigSchema>;

const BooleanLikeSchema = z.preprocess(
  (value) => {
    if (value === 1 || value === '1') return true;
    if (value === 0 || value === '0') return false;
    return value;
  },
  z.boolean(),
);

// Transaction-specific schema (matches backend DB columns exactly)
export const TransactionSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  user_id: z.number().optional().nullable(),
  date: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number(),
  category: z.string(),
  is_fixed: BooleanLikeSchema.optional().default(false),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Generic Paginated Response Schema
const PaginatedResponseSchema = z.object({
  response: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.array(z.unknown()),
});

export type PaginatedResponse<T> = {
  response: boolean;
  status: number;
  message: string;
  data: T[];
};

// Pagination metadata schema
const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total_pages: z.number().int().positive(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// Paginated Data Response from Laravel
export const LaravelPaginatedSchema = z.object({
  current_page: z.number().int().positive(),
  data: z.array(TransactionSchema).nullable().default([]),
  first_page_url: z.string(),
  from: z.number().int().nullable(),
  last_page: z.number().int().positive(),
  last_page_url: z.string(),
  links: z.array(z.object({
    url: z.string().nullable(),
    label: z.string(),
    active: z.boolean(),
  })).optional(),
  next_page_url: z.string().nullable(),
  path: z.string(),
  per_page: z.number().int().positive(),
  prev_page_url: z.string().nullable(),
  to: z.number().int().nullable(),
  total: z.number().int().nonnegative(),
});

export type LaravelPaginated = z.infer<typeof LaravelPaginatedSchema>;

// Typed Paginated Response for Transactions
export const TransactionPaginatedResponseSchema = z.object({
  response: z.boolean(),
  status: z.number().optional(),
  message: z.string(),
  data: LaravelPaginatedSchema,
});

export type TransactionPaginatedResponse = z.infer<typeof TransactionPaginatedResponseSchema>;

export const FiltersSchema = z.object({
  year: z.number().int().optional(),
  month: z.number().int().optional(),
  page: z.number().int().optional(),
  search: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  order_by: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
  page_size: z.number().int().optional(),
});

export type Filters = z.infer<typeof FiltersSchema>;

// Card schema
export const CardSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  user_id: z.number().optional().nullable(),
  type: z.enum(['credit', 'debit']),
  name: z.string(),
  last_four: z.string(),
  bank: z.string(),
  credit_limit: z.coerce.number().nullable(),
  current_balance: z.coerce.number(),
  expiry_date: z.string(),
  is_active: z.boolean(),
  active_purchases_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Card = z.infer<typeof CardSchema>;

export const CardPaginatedResponseSchema = z.object({
  response: z.boolean(),
  message: z.string(),
  data: z.object({
    current_page: z.number(),
    data: z.array(CardSchema).default([]),
    last_page: z.number(),
    total: z.number(),
    per_page: z.number(),
    from: z.number().nullable(),
    to: z.number().nullable(),
    first_page_url: z.string(),
    last_page_url: z.string(),
    next_page_url: z.string().nullable(),
    prev_page_url: z.string().nullable(),
    path: z.string(),
    links: z.array(z.object({ url: z.string().nullable(), label: z.string(), active: z.boolean() })).optional(),
  }),
});

export type CardPaginatedResponse = z.infer<typeof CardPaginatedResponseSchema>;

// Card Purchase schema
export const CardPurchaseSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  card_id: z.number(),
  user_id: z.number().optional().nullable(),
  description: z.string(),
  total_amount: z.coerce.number(),
  installments: z.number(),
  current_installment: z.number(),
  interest_rate: z.coerce.number(),
  installment_amount: z.coerce.number(),
  purchase_date: z.string(),
  category: z.string().nullable(),
  status: z.enum(['pending', 'partially_paid', 'overdue', 'paid']).default('pending'),
  next_payment_date: z.string().nullable().optional(),
  card: z.object({ id: z.number(), uuid: z.string(), name: z.string(), last_four: z.string(), bank: z.string() }).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const CardPaymentSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  card_purchase_id: z.number(),
  card_id: z.number(),
  installment_number: z.number(),
  amount: z.coerce.number(),
  payment_date: z.string(),
  notes: z.string().nullable(),
});

export type CardPayment = z.infer<typeof CardPaymentSchema>;

export type CardPurchase = z.infer<typeof CardPurchaseSchema>;

export const CardPurchasePaginatedResponseSchema = z.object({
  response: z.boolean(),
  message: z.string(),
  data: z.object({
    current_page: z.number(),
    data: z.array(CardPurchaseSchema).default([]),
    last_page: z.number(),
    total: z.number(),
    per_page: z.number(),
    from: z.number().nullable(),
    to: z.number().nullable(),
    first_page_url: z.string(),
    last_page_url: z.string(),
    next_page_url: z.string().nullable(),
    prev_page_url: z.string().nullable(),
    path: z.string(),
    links: z.array(z.object({ url: z.string().nullable(), label: z.string(), active: z.boolean() })).optional(),
  }),
});
