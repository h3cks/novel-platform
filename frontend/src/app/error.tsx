'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
                                      error,
                                      reset,
                                    }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // В ідеалі тут має бути логування помилки в сервіси типу Sentry
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Щось пішло не так</h2>
      <p className="text-slate-500 max-w-md mb-8">
        Вибачте, сталася непередбачувана помилка. Ми вже працюємо над її вирішенням.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Спробувати знову
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          На головну
        </Link>
      </div>
    </div>
  );
}