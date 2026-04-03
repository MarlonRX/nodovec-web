import { z } from "astro:content";

// Schema para la transacción tal como viene del backend (strings)
export const TransactionSchema = z.object({
    id: z.number(),
    uuid: z.string(),
    transaction_date: z.string(),
    description: z.string(),
    user_id: z.number().optional().nullable(),
    amount: z.string(), // El backend devuelve BigDecimal como string
    type: z.enum(['income', 'expense']),
    category_id: z.string(), // El backend devuelve category como string
    status: z.enum(['pending', 'completed', 'canceled']),
    is_recurring: z.boolean(),
    recurrence_interval: z.string().nullable().or(z.literal("")),
    recurrence_days: z.number().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Schema para la respuesta paginada
export const TransactionPaginatedResponseSchema = z.object({
    response: z.boolean(),
    status: z.number(),
    message: z.string(),
    data: z.array(TransactionSchema).optional(),
});

export type TransactionPaginatedResponse = z.infer<typeof TransactionPaginatedResponseSchema>;

// Schema para crear una transacción
export const CreateTransactionSchema = z.object({
    transaction_date: z.string().or(z.date()),
    description: z.string(),
    user_id: z.number().optional().nullable(),
    amount: z.string().or(z.number()),
    type: z.enum(['income', 'expense']),
    category: z.string(),
    is_recurring: z.boolean().optional().default(false),
    recurrence_interval: z.string().optional().nullable(),
    recurrence_days: z.number().optional().nullable(),
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionSchema>;

// Filters para paginación
export const FiltersSchema = z.object({
    page: z.number().default(1),
    per_page: z.number().default(10),
});

export type Filters = z.infer<typeof FiltersSchema>;

// Columnas para la tabla
export interface Column {
    key: keyof Transaction;
    label: string;
    sortable: boolean;
    render?: (value: any, row: Transaction) => React.ReactNode;
}