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
  coverUrl: z.string().url('Некоректний URL обкладинки').optional().or(z.literal('')),

  genreIds: z
    .array(z.number())
    .min(1, 'Оберіть хоча б 1 жанр')
    .max(5, 'Можна обрати максимум 5 жанрів'), // Виправлено текст помилки
  tagIds: z
    .array(z.number())
    .max(20, 'Можна обрати максимум 20 тегів')
    .default([]),

  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type NovelFormValues = z.infer<typeof novelSchema>;