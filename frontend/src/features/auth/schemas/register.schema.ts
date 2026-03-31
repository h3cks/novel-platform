import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Ім\'я користувача має містити мінімум 3 символи')
    .max(20, 'Ім\'я користувача занадто довге'),
  email: z.string().email('Некоректний формат email'),
  password: z
    .string()
    .min(8, 'Пароль має містити мінімум 8 символів')
    .regex(/[A-Z]/, 'Пароль має містити хоча б одну велику літеру')
    .regex(/[0-9]/, 'Пароль має містити хоча б одну цифру'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не збігаються",
  path: ["confirmPassword"], // Вказуємо, на якому полі показати помилку
});

export type RegisterFormValues = z.infer<typeof registerSchema>;