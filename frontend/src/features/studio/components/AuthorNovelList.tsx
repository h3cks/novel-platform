'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNovels } from '@/features/novels/hooks/useNovels';
import Link from 'next/link';

export const AuthorNovelList = () => {
  const user = useAuthStore((state) => state.user);

  // Передаємо authorId, щоб бекенд повернув тільки новели цього юзера (включаючи DRAFT)
  const { data, isLoading, isError } = useNovels({ authorId: user?.id });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col gap-4 mt-4">
        <div className="h-32 bg-gray-100 rounded-lg w-full"></div>
        <div className="h-32 bg-gray-100 rounded-lg w-full"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500 mt-4 font-medium">Помилка завантаження новел. Спробуйте пізніше.</div>;
  }

  const novels = data || [];

  if (novels.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">У вас ще немає творів</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Почніть свою письменницьку подорож прямо зараз. Створіть першу новелу, додайте розділи та поділіться нею з читачами.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 mt-4">
      {novels.map((novel: any) => (
        <div key={novel.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:shadow-md transition-shadow">
          {novel.coverUrl ? (
            <img src={novel.coverUrl} alt={novel.title} className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-md shadow-sm shrink-0" />
          ) : (
            <div className="w-16 h-24 sm:w-20 sm:h-28 bg-slate-100 rounded-md shadow-sm flex items-center justify-center text-slate-400 text-xs text-center shrink-0">
              Немає<br/>обкладинки
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">{novel.title}</h3>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                novel.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                  novel.status === 'REVIEWING' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
              }`}>
                {novel.status === 'PUBLISHED' ? 'Опубліковано' : novel.status === 'REVIEWING' ? 'Модерація' : 'Чернетка'}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {novel.description || 'Опис відсутній. Додайте його, щоб залучити більше читачів.'}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Ці роути ми будемо реалізовувати наступними */}
              <Link href={`/studio/novels/${novel.id}/chapters`} className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md transition-colors shadow-sm">
                Розділи
              </Link>
              <Link href={`/studio/novels/${novel.id}/edit`} className="text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-md transition-colors">
                Редагувати дані
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};