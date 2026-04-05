'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';

const ConfirmContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Перевірка токена...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен підтвердження відсутній у посиланні.');
      return;
    }

    // Відправляємо запит на бекенд для верифікації токена
    apiClient.get(`/auth/confirm?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Ваш Email успішно підтверджено!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Недійсний або прострочений токен.');
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">

      {/* Стан: Завантаження */}
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Підтвердження...</h2>
          <p className="text-gray-500 text-sm">{message}</p>
        </div>
      )}

      {/* Стан: Успіх */}
      {status === 'success' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Успішно!</h2>
          <p className="text-gray-600 mb-8">{message}</p>
          <Link href="/auth/login" className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Увійти в акаунт
          </Link>
        </div>
      )}

      {/* Стан: Помилка */}
      {status === 'error' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Помилка</h2>
          <p className="text-gray-600 mb-8">{message}</p>
          <Link href="/auth/login" className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
            Повернутися до входу
          </Link>
        </div>
      )}
    </div>
  );
};

// Next.js вимагає обгортати клієнтські компоненти з searchParams у Suspense
export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-gray-500">Завантаження сторінки...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}