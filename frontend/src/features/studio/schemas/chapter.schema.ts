import { z } from 'zod';

export const chapterSchema = z.object({
  title: z
    .string()
    .min(1, 'Назва розділу є обов\'язковою')
    .max(255, 'Назва занадто довга'),
  content: z
    .string()
    .min(15, 'Текст розділу занадто короткий')
    .refine((val) => {
      // Видаляємо HTML теги для перевірки реальної довжини тексту
      const strippedContent = val.replace(/(<([^>]+)>)/gi, "").trim();
      return strippedContent.length > 0;
    }, 'Розділ не може бути порожнім'),
});

export type ChapterFormValues = z.infer<typeof chapterSchema>;