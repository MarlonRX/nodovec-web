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
export const TableConfigSchema = z.object({
  columns: z.array(ColumnSchema),
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  data: z.array(z.object({ id: z.union([z.string(), z.number()]) }).passthrough(),
  ),
});

export type TableConfig = z.infer<typeof TableConfigSchema>;

// Transaction-specific schema (matches backend DB columns exactly)
export const TransactionSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  user_id: z.number().optional().nullable(),
  date: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number(),
  category: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Generic Paginated Response Schema
export const PaginatedResponseSchema = z.object({
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
export const PaginationMetaSchema = z.object({
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
});

export type Filters = z.infer<typeof FiltersSchema>;