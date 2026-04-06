'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNovels } from '@/features/novels/hooks/useNovels';
import Link from 'next/link';

export const AuthorNovelList = ({ novels }: { novels: any }) => {
  // 1. ДОДАЄМО БЕЗПЕЧНЕ ВИТЯГНЕННЯ МАСИВУ:
  const novelsArray = Array.isArray(novels)
    ? novels
    : novels?.items || novels?.data?.items || novels?.data || [];

  // 2. Перевіряємо, чи масив не порожній
  if (!novelsArray || novelsArray.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg border border-slate-200 mt-4">
        <p className="text-slate-500 mb-4">У вас ще немає створених новел.</p>
        <Link href="/studio/novels/create" className="text-indigo-600 font-semibold hover:underline">
          Створити першу новелу &rarr;
        </Link>
      </div>
    );
  }


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
      {/* 3. ВИКОРИСТОВУЄМО novelsArray ЗАМІСТЬ novels */}
      {novelsArray.map((novel: any) => (
        <div key={novel.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:shadow-md transition-shadow">
          {novel.coverUrl ? (
            <img src={novel.coverUrl} alt={novel.title} className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-md shadow-sm shrink-0" />
          ) : (
            <div className="w-16 h-24 sm:w-20 sm:h-28 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-xs shrink-0">
              Немає обкладинки
            </div>
          )}

          <div className="flex-1">
            <Link href={`/studio/novels/${novel.id}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
              {novel.title}
            </Link>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{novel.description || 'Опис відсутній...'}</p>
            <div className="mt-3 flex gap-2">
               <span className={`text-xs font-semibold px-2 py-1 rounded-full ${novel.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                 {novel.status === 'PUBLISHED' ? 'Опубліковано' : 'Чернетка'}
               </span>
            </div>
          </div>

          <div className="flex gap-3 sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0">
            <Link href={`/studio/novels/${novel.id}`} className="flex-1 sm:flex-none text-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
              Управління
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};