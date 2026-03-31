import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Моя Бібліотека | NovelHub',
};

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Моя Бібліотека</h1>
          <Link href="/novels" className="text-blue-600 hover:underline font-medium">
            Знайти нові новели &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Тут поки порожньо</h3>
          <p className="text-gray-500 max-w-md">
            Ваші збережені новели, закладки та історія читання будуть відображатися тут. Цей розділ знаходиться в стадії розробки.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}