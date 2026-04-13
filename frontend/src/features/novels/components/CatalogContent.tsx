'use client';

import { useState } from 'react';
import { useNovels } from '../hooks/useNovels';
import { NovelList } from './NovelList';

export const CatalogContent = () => {
  const [page, setPage] = useState(1);
  const limit = 10; // 10 новел на сторінку

  // Припускаємо, що хук useNovels передає параметри далі в API
  const { data, isLoading, isError } = useNovels({ page, limit });

  if (isLoading) {
    return <div className="text-center text-slate-500 py-10">Завантаження каталогу...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Помилка завантаження новел.</div>;
  }

  const handleNext = () => setPage((prev) => prev + 1);
  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));

  // Якщо data.total повернуто бекендом, ви можете використовувати його для визначення останньої сторінки
  const hasMore = Array.isArray(data) ? data.length === limit : false;

  return (
    <div className="space-y-8">
      <NovelList novels={data} />

      {/* Пагінація */}
      <div className="flex justify-center items-center gap-4 py-6 border-t border-slate-100 mt-8">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 hover:bg-slate-50 hover:text-indigo-600 transition-all font-semibold text-slate-700"
        >
          &larr; Попередня
        </button>
        <span className="text-slate-600 font-bold bg-slate-100 px-4 py-2 rounded-lg">
          {page}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasMore}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 hover:bg-slate-50 hover:text-indigo-600 transition-all font-semibold text-slate-700"
        >
          Наступна &rarr;
        </button>
      </div>
    </div>
  );
};