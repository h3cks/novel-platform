'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ДОДАНО ІМПОРТ ТИПУ:
import { AuthResponse } from '@/features/auth/types';

const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Мінімум 6 символів'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  // Додано явну типізацію стану, хоча Zustand мав би її підхопити автоматично
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // ВИПРАВЛЕНО: Явна типізація useMutation <ДаніВідповіді, Помилка, ВхідніДані>
  const loginMutation = useMutation<AuthResponse, Error, LoginFormValues>({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // Тепер TypeScript знає, що 'response' це AuthResponse
      setAuth(response.data.user, response.data.accessToken);
      router.push('/profile');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-6">Вхід у NovelHub</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Пароль</label>
          <input
            type="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {loginMutation.isError && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            Невірний email або пароль
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loginMutation.isPending ? 'Завантаження...' : 'Увійти'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Ще немає акаунта? <Link href="/register" className="text-blue-600 hover:underline">Зареєструватися</Link>
      </p>
    </div>
  );
}