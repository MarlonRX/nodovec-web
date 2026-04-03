import { z } from 'zod';

export const CategoryTypeSchema = z.enum(['income', 'expense']);

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  type: CategoryTypeSchema,
  color: z.string(),
  icon: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;
