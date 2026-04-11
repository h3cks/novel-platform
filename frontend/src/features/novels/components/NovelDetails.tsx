'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { libraryService } from '@/features/library/api/library.service';
import { novelsService } from '../api/novels.service';

interface NovelDetailsProps {
  novelId: string | number;
}

export const NovelDetails = ({ novelId }: NovelDetailsProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState(0);

  // 1. ДОДАНО: Отримуємо дані новели безпосередньо в компоненті
  const { data: novel, isLoading: isNovelLoading } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: () => novelsService.getNovelById(novelId),
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['library', 'bookmarks'],
    queryFn: libraryService.getBookmarks,
    enabled: !!user,
  });

  // 2. ДОДАНО: Стан завантаження
  if (isNovelLoading) {
    return <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 h-96 animate-pulse mb-8"></div>;
  }

  // 3. ДОДАНО: Перевірка на існування новели
  if (!novel) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 mb-8">
        <h2 className="text-2xl font-bold text-slate-400">Новелу не знайдено</h2>
      </div>
    );
  }

  const isBookmarked = bookmarks?.some((b: any) => b.novelId === novel.id);

  const toggleBookmarkMutation = useMutation({
    mutationFn: () => isBookmarked ? libraryService.removeBookmark(novel.id) : libraryService.addBookmark(novel.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library', 'bookmarks'] }),
  });

  const rateMutation = useMutation({
    mutationFn: (score: number) => novelsService.rateNovel(novel.id, score),
    onSuccess: () => {
      alert('Оцінку враховано!');
      queryClient.invalidateQueries({ queryKey: ['novel', novel.id] });
    }
  });

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 mb-8">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="flex-shrink-0 w-64 md:w-72 mx-auto md:mx-0">
          <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            {novel.coverUrl ? (
              <Image src={novel.coverUrl} alt={novel.title} fill className="object-cover" sizes="300px" priority />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">Немає обкладинки</div>
            )}
          </div>
        </div>

        <div className="flex-grow flex flex-col">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{novel.title}</h1>
          <p className="text-lg text-slate-600 mb-6 font-medium">Автор: <span className="text-indigo-600">{novel.author?.username || 'Невідомий'}</span></p>

          <div className="flex flex-wrap gap-2 mb-6">
            {novel.genres?.map((g: any) => (
              <span key={g.genre.id} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{g.genre.name}</span>
            ))}
            {novel.tags?.map((t: any) => (
              <span key={t.tag.id} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">#{t.tag.name}</span>
            ))}
          </div>

          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div className="flex gap-6 text-sm text-slate-500 font-semibold">
              <div className="flex flex-col"><span className="text-2xl font-black text-slate-800">{novel.wordCount || 0}</span><span>Слів</span></div>
              <div className="flex flex-col"><span className="text-2xl font-black text-slate-800">{novel.chapters?.length || 0}</span><span>Розділів</span></div>
            </div>

            {user && (
              <div className="ml-auto flex flex-col items-end">
                <span className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-widest">ОЦІНИТИ</span>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onMouseEnter={() => setHoverRating(s)} onClick={() => rateMutation.mutate(s)} className={`text-2xl transition-transform ${s <= (hoverRating || 0) ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}>★</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href={`/novels/${novel.id}/chapters/${novel.chapters?.[0]?.id || ''}`} className={`flex-1 text-center py-3.5 rounded-xl font-bold text-white transition-colors ${novel.chapters?.length ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' : 'bg-slate-300 pointer-events-none'}`}>
              {novel.chapters?.length ? 'Почати читати' : 'Немає розділів'}
            </Link>
            {user && (
              <button onClick={() => toggleBookmarkMutation.mutate()} disabled={toggleBookmarkMutation.isPending} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all ${isBookmarked ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600'}`}>
                {isBookmarked ? 'В бібліотеці' : '+ До бібліотеки'}
              </button>
            )}
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Опис</h3>
            <p className="whitespace-pre-line">{novel.description || 'Опис відсутній.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};