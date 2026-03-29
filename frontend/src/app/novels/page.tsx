'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { novelsService } from '@/features/novels/api/novels.service';

export default function NovelsPage() {
  const { data: novels, isLoading, isError } = useQuery({
    queryKey: ['novels'],
    queryFn: novelsService.getNovels,
  });

  if (isLoading) {
    return <div className="flex justify-center py-20 text-slate-500">Загрузка каталога...</div>;
  }

  if (isError) {
    return <div className="text-center py-20 text-red-500">Ошибка при загрузке новелл.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Каталог новелл</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {novels?.map((novel) => (
          <Link key={novel.id} href={`/novels/${novel.id}`} className="group block">
            <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md ring-1 ring-slate-200">
              <div className="aspect-[2/3] w-full bg-slate-100">
                {novel.coverUrl ? (
                  <img src={novel.coverUrl} alt={novel.title} className="h-full w-full object-cover group-hover:opacity-90" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">Нет обложки</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{novel.title}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{novel.description || 'Нет описания'}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{novel.author?.displayName || novel.author?.username || 'Неизвестный автор'}</span>
                  <span>{novel.status === 'PUBLISHED' ? 'Опубликовано' : novel.status}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {novels?.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-10">Новеллы пока не добавлены.</div>
        )}
      </div>
    </div>
  );
}