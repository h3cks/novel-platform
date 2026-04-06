'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePasswordReset } from '@/features/auth/hooks/usePasswordReset';
import { isAxiosError } from 'axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Введіть коректну електронну адресу'),
});

type FormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { requestResetMutation } = usePasswordReset();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: FormData) => {
    requestResetMutation.mutate(data.email, {
      onSuccess: () => setIsSuccess(true),
    });
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Відновлення пароля</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Введіть ваш email, і ми надішлемо посилання для відновлення
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Лист надіслано!</h3>
          <p className="text-slate-500 text-sm mb-6">Перевірте вашу поштову скриньку та перейдіть за посиланням.</p>
          <Link href="/auth/login" className="text-indigo-600 font-semibold hover:underline">
            Повернутися до входу
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {requestResetMutation.isError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {isAxiosError(requestResetMutation.error)
                ? requestResetMutation.error.response?.data?.message || 'Помилка сервера'
                : 'Не вдалося надіслати запит'}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              disabled={requestResetMutation.isPending}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={requestResetMutation.isPending}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-70 flex justify-center"
          >
            {requestResetMutation.isPending ? 'Надсилання...' : 'Надіслати посилання'}
          </button>

          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600">
              Я згадав пароль. Увійти
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}