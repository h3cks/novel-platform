// src/features/novels/components/RecommendedNovels.tsx
'use client';

import { useRecommendedNovels } from '../hooks/useNovels';
import { NovelCard } from './NovelCard';
import { Novel } from '../types';

export const RecommendedNovels = () => {

  const { data: novels, isLoading, isError } = useRecommendedNovels();

  if (isLoading) {
    return (
      <div className="py-8 border-t border-slate-100 mt-10">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Схожі новели</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Приводимо до any, щоб уникнути помилки TS2339 (never)
  const responseData = novels as any;

  // Безпечно дістаємо масив новел, незалежно від того, що повернув бекенд
  const novelsArray = Array.isArray(responseData)
    ? responseData
    : responseData?.items || responseData?.data?.items || [];

  // Якщо сталася помилка або список порожній — просто нічого не рендеримо
  if (isError || !novelsArray || novelsArray.length === 0) {
    return null;
  }

  // Залишаємо тільки перші 4 новели для гарного відображення
  const displayNovels = novelsArray.slice(0, 4);

  return (
    <div className="py-8 border-t border-slate-100 mt-10">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">Вам також може сподобатися</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {displayNovels.map((novel: Novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>
    </div>
  );
};