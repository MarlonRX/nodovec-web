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

export const CreateCategoryDataSchema = z.object({
  name: z.string(),
  type: CategoryTypeSchema,
  color: z.string().optional().default('#3B82F6'),
  icon: z.string().optional().default('folder'),
});

export type CreateCategoryData = z.infer<typeof CreateCategoryDataSchema>;
