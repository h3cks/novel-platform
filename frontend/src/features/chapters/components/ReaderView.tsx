'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useChapter } from '../hooks/useChapter';
import { useReaderStore } from '@/store/useReaderStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { chaptersService } from '../api/chapters.service';
import { libraryService } from '@/features/library/api/library.service';
import { ReaderSettings } from './ReaderSettings';
import { CommentSection } from '@/features/comments/components/CommentSection';
import DOMPurify from 'dompurify';

interface ReaderViewProps {
  novelId: string;
  chapterId: string;
}

export const ReaderView = ({ novelId, chapterId }: ReaderViewProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: chapter, isLoading, isError } = useChapter(novelId, chapterId);
  const { fontSize, theme } = useReaderStore();
  const [mounted, setMounted] = useState(false);
  const [cleanContent, setCleanContent] = useState<string>('');

  const { data: allChapters } = useQuery({
    queryKey: ['chapters', novelId],
    queryFn: () => chaptersService.getNovelChapters(novelId),
  });

  const deleteChapterMutation = useMutation({
    mutationFn: () => chaptersService.deleteChapter(novelId, chapterId),
    onSuccess: () => {
      alert('Розділ успішно видалено.');
      router.push(`/novels/${novelId}`);
    }
  });

  useEffect(() => {
    setMounted(true);
    if (chapter?.content) {
      setCleanContent(DOMPurify.sanitize(chapter.content));
    }

    // ДОДАНО: Запис в історію при завантаженні розділу
    if (chapter && user) {
      libraryService.recordHistory(novelId, chapterId).catch(console.error);
    }
  }, [chapter, novelId, chapterId, user]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-10 mx-auto"></div>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !chapter) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Розділ не знайдено</h2>
        <Link href={`/novels/${novelId}`} className="text-blue-600 hover:underline">
          Повернутися до новели
        </Link>
      </div>
    );
  }

  const themeClasses = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-[#fcf8ef] text-[#5b4636]',
    dark: 'bg-[#121212] text-gray-300',
  };

  const activeThemeClass = mounted ? themeClasses[theme] : themeClasses.light;
  const prevChapterId = chapter?.prevChapterId;
  const nextChapterId = chapter?.nextChapterId;

  const canDelete = user && (user.role === 'ADMIN' || user.role === 'AUTHOR');

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${activeThemeClass}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href={`/novels/${novelId}`} className="text-sm font-medium opacity-70 hover:opacity-100 flex items-center gap-1 transition-opacity">
            &larr; До новели
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {allChapters && allChapters.length > 0 && (
              <select
                className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                value={chapterId}
                onChange={(e) => router.push(`/novels/${novelId}/chapters/${e.target.value}`)}
              >
                {allChapters.map((ch: any) => (
                  <option key={ch.id} value={ch.id} className="text-black">
                    Розділ {ch.order}: {ch.title}
                  </option>
                ))}
              </select>
            )}

            {canDelete && (
              <button
                onClick={() => { if(confirm('Ви впевнені, що хочете видалити розділ?')) deleteChapterMutation.mutate(); }}
                disabled={deleteChapterMutation.isPending}
                className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-bold transition flex-shrink-0"
              >
                Видалити
              </button>
            )}
          </div>
        </div>

        <ReaderSettings />

        <article>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-12 text-center leading-tight">
            Розділ {chapter.order}: {chapter.title}
          </h1>

          <div
            className="prose prose-lg max-w-none prose-headings:font-bold reader-content leading-relaxed"
            style={{ fontSize: mounted ? `${fontSize}px` : '18px' }}
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </article>

        <div className="mt-16 pt-8 border-t border-gray-200/20 flex justify-between items-center">
          {prevChapterId ? (
            <Link href={`/novels/${novelId}/chapters/${prevChapterId}`} className="px-6 py-2 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition">
              &larr; Попередній
            </Link>
          ) : <div />}

          {nextChapterId ? (
            <Link href={`/novels/${novelId}/chapters/${nextChapterId}`} className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition">
              Наступний &rarr;
            </Link>
          ) : <span className="text-gray-400 italic">Це останній розділ</span>}
        </div>

        <CommentSection chapterId={chapterId} />
      </div>
    </div>
  );
};