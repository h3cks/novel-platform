'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';
import { useLogin } from '../hooks/useLogin';

export const LoginForm = () => {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Вхід у NovelHub</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          disabled={isPending}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          placeholder="your@email.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
        <input
          {...register('password')}
          type="password"
          disabled={isPending}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          Помилка входу. Перевірте ваші дані.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
      >
        {isPending ? 'Завантаження...' : 'Увійти'}
      </button>
    </form>
  );
};