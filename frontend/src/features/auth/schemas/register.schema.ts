import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Ім\'я користувача має містити мінімум 3 символи')
    .max(30, 'Ім\'я користувача занадто довге')
    .regex(/^[a-zA-Z0-9_]+$/, 'Тільки латинські літери, цифри та підкреслення (без пробілів)'),
  email: z.string().email('Некоректний формат email'),
  password: z
    .string()
    .min(8, 'Пароль має містити мінімум 8 символів')
    .regex(/[A-Z]/, 'Пароль має містити хоча б одну велику літеру')
    .regex(/[a-z]/, 'Пароль має містити хоча б одну малу літеру')
    .regex(/[0-9]/, 'Пароль має містити хоча б одну цифру')
    .regex(/[^A-Za-z0-9]/, 'Пароль має містити спецсимвол (наприклад !@#$%)'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не збігаються",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;