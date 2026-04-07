'use client';

import Link from 'next/link';
import { useLatestUpdates } from '@/features/novels/hooks/useNovels';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale'; // Якщо хочете українською

export const LatestUpdates = () => {
  const { data: updates, isLoading } = useLatestUpdates();

  return (
    <section className="py-6 mb-12">
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
          Останні оновлення
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-slate-100 rounded w-full"></div>
            ))}
          </div>
        ) : updates && updates.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {updates.map((update) => (
              <li key={update.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <Link href={`/novels/${update.novelId}`} className="font-bold text-slate-900 hover:text-indigo-600 text-sm sm:text-base line-clamp-1">
                    {update.novelTitle}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">Автор: {update.authorUsername}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:min-w-[300px]">
                  <Link
                    href={`/novels/${update.novelId}/chapters/${update.chapterId}`}
                    className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    {update.chapterTitle || `Розділ ${update.chapterNumber}`}
                  </Link>
                  <span className="text-xs font-medium text-slate-400 shrink-0">
                    {formatDistanceToNow(new Date(update.updatedAt), { addSuffix: true, locale: uk })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-slate-500">Ще немає жодних оновлень.</div>
        )}
      </div>
    </section>
  );
};