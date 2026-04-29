'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';
import { isAxiosError } from 'axios';

const ConfirmContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ['confirm-email', token],
    queryFn: async () => {
      const { data } = await apiClient.get(`/auth/confirm?token=${token}`);
      return data;
    },
    enabled: !!token,
    retry: false, // Не повторювати запит, якщо токен недійсний
    refetchOnWindowFocus: false, // Запобігає подвійному спрацьовуванню
  });

  // Витягуємо повідомлення про помилку безпечно
  const errorMessage = isAxiosError(error)
    ? error.response?.data?.message || 'Недійсний або прострочений токен.'
    : 'Сталася невідома помилка.';

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">

      {/* Стан: Немає токена */}
      {!token && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Помилка посилання</h2>
          <p className="text-gray-600 mb-8">Токен підтвердження відсутній у посиланні.</p>
          <Link href="/auth/login" className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Повернутися до входу
          </Link>
        </div>
      )}

      {/* Стан: Завантаження */}
      {token && isLoading && (
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Підтвердження...</h2>
          <p className="text-gray-500 text-sm">Перевірка токена...</p>
        </div>
      )}

      {/* Стан: Успіх */}
      {token && isSuccess && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Успішно!</h2>
          <p className="text-gray-600 mb-8">Ваш Email успішно підтверджено!</p>
          <Link href="/auth/login" className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Увійти в акаунт
          </Link>
        </div>
      )}

      {/* Стан: Помилка */}
      {token && isError && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Помилка</h2>
          <p className="text-gray-600 mb-8">{errorMessage}</p>
          <Link href="/auth/login" className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Повернутися до входу
          </Link>
        </div>
      )}
    </div>
  );
};

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-gray-500 animate-pulse">Завантаження сторінки...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}