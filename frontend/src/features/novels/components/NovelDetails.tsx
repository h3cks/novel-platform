'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { libraryService } from '@/features/library/api/library.service';
import { novelsService } from '../api/novels.service';
import toast from 'react-hot-toast';
import { ReportModal } from '@/features/reports/components/ReportModal';

interface NovelDetailsProps {
  novelId: string | number;
}

export const NovelDetails = ({ novelId }: NovelDetailsProps) => {
  const { user } = useAuthStore();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [hoverRating, setHoverRating] = useState(0);
  const [lastReadChapterId, setLastReadChapterId] = useState<string | null>(null);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`novel_progress_${novelId}`);
    if (savedProgress) {
      setLastReadChapterId(savedProgress);
    }
  }, [novelId]);


  const { data: novel, isLoading: isNovelLoading } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: () => novelsService.getNovelById(novelId),
  });

  const { data: bookmarks } = useQuery({
    queryKey: ['library', 'bookmarks'],
    queryFn: libraryService.getBookmarks,
    enabled: !!user,
  });

  const isBookmarked = bookmarks?.some((b: any) => b.novelId === novel?.id);

  const toggleBookmarkMutation = useMutation({
    mutationFn: () => isBookmarked ? libraryService.removeBookmark(novel!.id) : libraryService.addBookmark(novel!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['novel', novelId] });
    }
  });

  const rateMutation = useMutation({
    mutationFn: (score: number) => novelsService.rateNovel(novel!.id, score),
    onSuccess: () => {
      toast.success('Оцінку враховано!');
      queryClient.invalidateQueries({ queryKey: ['novel', novel!.id] });
    },
    onError: () => {
      toast.error('Не вдалося зберегти оцінку');
    }
  });

  const deleteNovelMutation = useMutation({
    mutationFn: () => novelsService.deleteNovel(novel!.id),
    onSuccess: () => {
      toast.success('Новелу успішно видалено.');
      router.push('/novels');
    },
    onError: () => {
      toast.error('Помилка при видаленні новели');
    }
  });

  if (isNovelLoading) {
    return <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 h-96 animate-pulse mb-8"></div>;
  }

  if (!novel) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 mb-8">
        <h2 className="text-2xl font-bold text-slate-400">Новелу не знайдено</h2>
      </div>
    );
  }

  const canDelete = user && (user.role === 'ADMIN' || user.id === novel.authorId);

  const averageRating = novel.ratings && novel.ratings.length > 0
    ? (novel.ratings.reduce((acc, curr) => acc + curr.score, 0) / novel.ratings.length).toFixed(1)
    : '0.0';
  const ratingCount = novel.ratings?.length || 0;

  const bookmarksCount = novel._count?.followers || 0;

  const hasChapters = novel.chapters && novel.chapters.length > 0;

  const validLastRead = lastReadChapterId && novel.chapters?.some((c: any) => c.id.toString() === lastReadChapterId);
  const targetChapterId = validLastRead ? lastReadChapterId : (novel.chapters?.[0]?.id || '');
  const buttonText = validLastRead ? 'Продовжити читати' : 'Почати читати';

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 mb-8">
      {user && (
        <button
          onClick={() => setIsReportOpen(true)}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors p-2"
          title="Поскаржитися на новелу"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </button>
      )}
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

        <div className="flex-grow flex flex-col relative">
          {canDelete && (
            <button
              onClick={() => { if(confirm('Ви впевнені, що хочете видалити цю новелу?')) deleteNovelMutation.mutate(); }}
              disabled={deleteNovelMutation.isPending}
              className="absolute top-0 right-0 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition"
            >
              Видалити новелу
            </button>
          )}

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 pr-32">{novel.title}</h1>

          <p className="text-lg text-slate-600 mb-6 font-medium">
            Автор: <Link href={`/users/${novel.author?.id || ''}`} className="text-indigo-600 hover:underline">{novel.author?.username || 'Невідомий'}</Link>
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {novel.genres?.map((g: any) => (
              <Link key={g.genre.id} href={`/novels?genre=${g.genre.name}`} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">
                {g.genre.name}
              </Link>
            ))}
            {novel.tags?.map((t: any) => (
              <Link key={t.tag.id} href={`/novels?tag=${t.tag.name}`} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1 rounded-full text-xs font-semibold transition-colors">
                #{t.tag.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 mb-8 pb-8 border-b border-slate-100 flex-wrap">
            <div className="flex gap-4 sm:gap-6 text-sm text-slate-500 font-semibold">
              <div className="flex flex-col"><span className="text-xl sm:text-2xl font-black text-slate-800">{novel.wordCount || 0}</span><span>Слів</span></div>
              <div className="flex flex-col"><span className="text-xl sm:text-2xl font-black text-slate-800">{novel.chapters?.length || 0}</span><span>Розділів</span></div>
              <div className="flex flex-col"><span className="text-xl sm:text-2xl font-black text-amber-500">{averageRating}</span><span>Оцінка ({ratingCount})</span></div>
              <div className="flex flex-col"><span className="text-xl sm:text-2xl font-black text-slate-800">{bookmarksCount}</span><span>В бібліотеці</span></div>
            </div>

            {user && (
              <div className="ml-auto flex flex-col items-end w-full sm:w-auto mt-4 sm:mt-0">
                <span className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-widest">ВАША ОЦІНКА</span>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onClick={() => rateMutation.mutate(s)}
                      className={`text-2xl transition-transform ${s <= (hoverRating || 0) ? 'text-yellow-400 scale-110 drop-shadow-sm' : 'text-slate-200'} hover:scale-125`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link
              href={`/novels/${novel.id}/chapters/${targetChapterId}`}
              className={`flex-1 text-center py-3.5 rounded-xl font-bold text-white transition-all ${
                hasChapters
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  : 'bg-slate-300 pointer-events-none'
              }`}
            >
              {hasChapters ? buttonText : 'Немає розділів'}
            </Link>
            {user && (
              <button onClick={() => toggleBookmarkMutation.mutate()} disabled={toggleBookmarkMutation.isPending} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all ${isBookmarked ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600'}`}>
                {isBookmarked ? '✓ В бібліотеці' : '+ До бібліотеки'}
              </button>
            )}
          </div>

          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            <h3 className="text-xl font-bold text-slate-900 mb-3">Опис</h3>
            <p className="whitespace-pre-line">{novel.description || 'Опис відсутній.'}</p>
          </div>
        </div>
      </div>

      <hr className="my-10 border-slate-100" />

      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Розділи</h3>
        {novel.chapters && novel.chapters.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {novel.chapters.map((chapter: any) => (
              <Link
                key={chapter.id}
                href={`/novels/${novel.id}/chapters/${chapter.id}`}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-colors group flex flex-col"
              >
                <div className="text-sm font-bold text-indigo-600 mb-1">Розділ {chapter.order}</div>
                <div className="text-slate-800 font-semibold group-hover:text-indigo-900 line-clamp-2">
                  {chapter.title}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 italic bg-slate-50 p-6 rounded-xl text-center font-medium">
            У цієї новели ще немає розділів.
          </div>
        )}
      </div>
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={novel.id}
        targetType="NOVEL"
      />
    </div>
  );
};