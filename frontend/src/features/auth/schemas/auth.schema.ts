import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Некоректний формат email'),
  password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;