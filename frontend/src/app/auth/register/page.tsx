'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthResponse } from '@/features/auth/types';

const registerSchema = z.object({
  email: z.string().email('Невірний формат email'),
  username: z.string().min(3, 'Мінімум 3 символи'),
  password: z.string().min(6, 'Мінімум 6 символів'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation<AuthResponse, Error, RegisterFormValues>({
    mutationFn: authService.register,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.accessToken);
      router.push('/profile');
    },
  });

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-6">Реєстрація</h1>

      <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input {...register('email')} className="mt-1 w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Нікнейм</label>
          <input {...register('username')} className="mt-1 w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" placeholder="User123" />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Пароль</label>
          <input type="password" {...register('password')} className="mt-1 w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {registerMutation.isError && <div className="text-red-600 text-sm p-2 bg-red-50 rounded">Помилка реєстрації. Перевірте дані.</div>}

        <button type="submit" disabled={registerMutation.isPending} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {registerMutation.isPending ? 'Завантаження...' : 'Створити акаунт'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Вже є акаунт? <Link href="/login" className="text-blue-600 hover:underline">Увійти</Link>
      </p>
    </div>
  );
}