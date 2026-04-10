'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';

interface ChapterListProps {
  novelId: string | number;
}

export const ChapterList = ({ novelId }: ChapterListProps) => {
  // Використовуємо React Query для завантаження розділів напряму через apiClient,
  // щоб уникнути помилок з відсутніми методами в сервісах
  const { data: chapters, isLoading, isError } = useQuery({
    queryKey: ['chapters', novelId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/novels/${novelId}/chapters`);
      // Адаптуємося під можливі варіанти відповіді бекенду
      return data.data?.items || data.items || data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="mt-10 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
        <div className="bg-slate-100 h-48 rounded-2xl"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-10 p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
        Виникла помилка при завантаженні списку розділів.
      </div>
    );
  }

  if (!chapters || chapters.length === 0) {
    return (
      <div className="mt-10 p-10 bg-slate-50 border border-slate-100 rounded-2xl text-center">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p className="text-slate-500 font-medium">Розділів ще немає. Автор працює над цим!</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Список розділів</h3>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {chapters.map((chapter: any, index: number) => (
            <Link
              key={chapter.id}
              href={`/novels/${novelId}/chapters/${chapter.id}`}
              className="flex items-center justify-between p-5 hover:bg-indigo-50/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-400 min-w-[2rem]">
                  #{index + 1}
                </span>
                <span className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  {chapter.title}
                </span>
              </div>
              <svg
                className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};