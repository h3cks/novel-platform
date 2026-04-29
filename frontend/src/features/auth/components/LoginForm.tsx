'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';
import { useLogin } from '../hooks/useLogin';
import { isAxiosError } from 'axios';

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

  const errorMessage = error
    ? (isAxiosError(error)
      ? error.response?.data?.message || 'Помилка сервера. Спробуйте пізніше.'
      : 'Сталася невідома помилка')
    : null;

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">З поверненням!</h2>
        <p className="text-slate-500 mt-2 text-sm">Увійдіть до свого акаунту NovelHub</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && errorMessage && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {errorMessage}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            disabled={isPending}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50"
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-semibold text-slate-700">Пароль</label>
            {/* Місце для посилання "Забули пароль?" у майбутньому */}
          </div>
          <input
            {...register('password')}
            type="password"
            disabled={isPending}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center mt-2"
        >
          {isPending ? 'Завантаження...' : 'Увійти'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Немає акаунту?{' '}
        <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          Зареєструватися
        </Link>
      </div>
    </div>
  );
};