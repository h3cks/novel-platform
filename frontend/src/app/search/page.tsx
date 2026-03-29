'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/features/search/api/search.service';
import Link from 'next/link';
import { Suspense } from 'react';

// Виокремлюємо контент у внутрішній компонент, щоб безпечно використовувати useSearchParams
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: novels, isLoading, isError } = useQuery({
    queryKey: ['searchNovels', query],
    queryFn: () => searchService.searchNovels({ keyword: query }),
    enabled: !!query, // Робимо запит тільки якщо є текст пошуку
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Результати пошуку</h1>
        <p className="mt-2 text-slate-600">
          {query ? (
            <>Показано результати для запиту: <span className="font-semibold text-indigo-600">"{query}"</span></>
          ) : (
            'Введіть пошуковий запит, щоб знайти книги.'
          )}
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="text-slate-500">Шукаємо новели...</div>
        </div>
      )}

      {isError && (
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-700 ring-1 ring-red-200 py-10">
          Сталася помилка під час виконання пошуку. Спробуйте пізніше.
        </div>
      )}

      {!isLoading && !isError && novels && novels.length === 0 && (
        <div className="text-center py-20 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
          <p className="text-lg font-medium text-slate-900">Нічого не знайдено</p>
          <p className="mt-1 text-sm text-slate-500">Спробуйте змінити ключові слова або перевірте правильність написання.</p>
        </div>
      )}

      {!isLoading && !isError && novels && novels.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {novels.map((novel) => (
            <Link key={novel.id} href={`/novels/${novel.id}`} className="group block">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md ring-1 ring-slate-200 flex flex-col h-full">
                <div className="aspect-[2/3] w-full bg-slate-100 flex-shrink-0 relative">
                  {novel.coverUrl ? (
                    <img src={novel.coverUrl} alt={novel.title} className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">Немає обкладинки</div>
                  )}
                  {/* Бадж статусу */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
                    {novel.status}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{novel.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2 flex-1">{novel.description || 'Немає опису'}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="truncate pr-2">Автор: {novel.author?.displayName || novel.author?.username || 'Невідомо'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Головний компонент сторінки, що обгортає контент у Suspense (вимога Next.js для useSearchParams)
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center py-20 text-slate-500">Завантаження сторінки пошуку...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}