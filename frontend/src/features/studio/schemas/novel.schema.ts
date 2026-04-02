import { z } from 'zod';

export const novelSchema = z.object({
  title: z.string().min(1, 'Назва новели обовʼязкова').max(100, 'Назва занадто довга'),
  description: z.string().optional(),

  // ДОДАНО НОВІ ПОЛЯ:
  coverUrl: z
    .string()
    .url('Введіть коректний URL (посилання)')
    .optional()
    .or(z.literal('')), // Дозволяємо порожній рядок, якщо обкладинки немає

  genres: z.string().optional(),

  tags: z.string().optional(),
});

export type NovelFormValues = z.infer<typeof novelSchema>;