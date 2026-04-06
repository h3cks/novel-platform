'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePasswordReset } from '@/features/auth/hooks/usePasswordReset';
import { isAxiosError } from 'axios';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Мінімум 8 символів'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Паролі не збігаються",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { resetPasswordMutation } = usePasswordReset();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-2xl text-red-700 border border-red-100">
        <h3 className="font-bold text-lg mb-2">Помилка посилання</h3>
        <p className="text-sm mb-4">Посилання для відновлення недійсне або відсутній токен.</p>
        <Link href="/auth/forgot-password" className="text-indigo-600 font-semibold hover:underline">
          Спробувати ще раз
        </Link>
      </div>
    );
  }

  const onSubmit = (data: FormData) => {
    resetPasswordMutation.mutate({ token, newPassword: data.newPassword }, {
      onSuccess: () => {
        alert('Пароль успішно змінено!');
        router.push('/auth/login');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {resetPasswordMutation.isError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {isAxiosError(resetPasswordMutation.error)
            ? resetPasswordMutation.error.response?.data?.message || 'Невірний або прострочений токен'
            : 'Сталася помилка'}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Новий пароль</label>
        <input
          {...register('newPassword')}
          type="password"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {errors.newPassword && <p className="text-red-500 text-xs mt-1.5">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Підтвердіть пароль</label>
        <input
          {...register('confirmPassword')}
          type="password"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={resetPasswordMutation.isPending}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-70"
      >
        {resetPasswordMutation.isPending ? 'Збереження...' : 'Змінити пароль'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Новий пароль</h2>
        <p className="text-slate-500 mt-2 text-sm">Створіть надійний пароль для вашого акаунту</p>
      </div>
      <Suspense fallback={<div className="text-center py-4">Перевірка...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}