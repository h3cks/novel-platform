import { z } from 'zod';

export const novelSchema = z.object({
  title: z
    .string()
    .min(3, 'Назва має містити мінімум 3 символи')
    .max(100, 'Назва занадто довга (максимум 100 символів)'),
  description: z
    .string()
    .max(2000, 'Опис занадто довгий (максимум 2000 символів)')
    .optional(),
});

export type NovelFormValues = z.infer<typeof novelSchema>;