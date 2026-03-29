'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { novelsService } from '@/features/novels/api/novels.service';
import { CommentSection } from '@/features/comments/components/CommentSection';

export default function NovelDetailsPage() {
  const { id } = useParams();

  const { data: novel, isLoading, isError } = useQuery({
    queryKey: ['novel', id],
    queryFn: () => novelsService.getNovelById(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div className="py-20 text-center text-slate-500">Загрузка книги...</div>;
  if (isError || !novel) return <div className="py-20 text-center text-red-500">Книга не найдена</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-slate-100">
            {novel.coverUrl ? (
              <img src={novel.coverUrl} alt={novel.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Нет обложки</div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{novel.title}</h1>
          <div className="mt-2 text-sm text-indigo-600 font-medium">
            Автор: {novel.author?.displayName || novel.author?.username || 'Неизвестно'}
          </div>

          <div className="mt-4 flex gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {novel.status}
            </span>
            {novel.wordCount && (
              <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                {novel.wordCount} слов
              </span>
            )}
          </div>

          <div className="mt-6 prose prose-slate prose-sm max-w-none">
            <h3 className="text-lg font-semibold text-slate-900">Описание</h3>
            <p className="whitespace-pre-wrap text-slate-600">{novel.description || 'Автор не добавил описание к этой книге.'}</p>
          </div>

          <div className="mt-8">
            <Link
              href={`/novels/${novel.id}/chapters`}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              Читать главы
            </Link>
          </div>

          <CommentSection novelId={novel.id} />
        </div>
      </div>
    </div>
  );
}