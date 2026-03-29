'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push('/'); // Перенаправляємо на головну після успішного входу
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.message || 'Помилка входу. Перевірте email та пароль.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Вхід до NovelHub
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {errorMsg}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Електронна пошта
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="yours@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? 'Виконується вхід...' : 'Увійти'}
            </button>
          </div>
        </form>
        <p className="mt-10 text-center text-sm text-slate-500">
          Ще не маєте акаунта?{' '}
          <Link href="/auth/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 transition-colors">
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
}