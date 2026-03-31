'use client';

import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/features/search/hooks/useSearch';
import { NovelCard } from '@/features/novels/components/NovelCard';
import { Suspense } from 'react';

// Компонент, який безпосередньо працює з searchParams
const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  const { data: novels, isLoading, isError } = useSearch({ q: query });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Результати пошуку</h1>
        {query ? (
          <p className="text-gray-600 mt-2">
            За запитом <span className="font-semibold text-gray-900">"{query}"</span>
          </p>
        ) : (
          <p className="text-gray-600 mt-2">Усі доступні новели</p>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4 h-96 border border-gray-100 shadow-sm flex flex-col">
              <div className="bg-gray-200 h-64 w-full rounded-md mb-4"></div>
              <div className="bg-gray-200 h-6 w-3/4 mb-2 rounded"></div>
              <div className="bg-gray-200 h-4 w-1/2 mb-4 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100 text-red-600">
          Під час пошуку сталася помилка. Спробуйте змінити запит.
        </div>
      )}

      {novels && novels.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Нічого не знайдено</h3>
          <p className="text-gray-500">
            На жаль, за вашим запитом немає результатів. Спробуйте використати інші ключові слова.
          </p>
        </div>
      )}

      {novels && novels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
};

// Next.js вимагає обгортати компоненти, що використовують useSearchParams, у Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-500">
        Завантаження пошуку...
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}