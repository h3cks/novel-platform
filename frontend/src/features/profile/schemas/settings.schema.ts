import { z } from 'zod';

export const settingsSchema = z.object({
  displayName: z
    .string()
    .max(50, 'Ім\'я не може перевищувати 50 символів')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Біографія занадто довга (максимум 500 символів)')
    .optional()
    .or(z.literal('')),
  avatarUrl: z
    .string()
    .url('Некоректний формат URL')
    .optional()
    .or(z.literal('')),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;