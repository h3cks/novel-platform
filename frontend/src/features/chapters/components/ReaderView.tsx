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
import { ReportModal } from '@/features/reports/components/ReportModal';
import DOMPurify from 'dompurify';

interface ReaderViewProps {
  novelId: string;
  chapterId: string;
}

export const ReaderView = ({ novelId, chapterId }: ReaderViewProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { data: chapter, isLoading, isError } = useChapter(novelId, chapterId);
  const { fontSize, theme } = useReaderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'dark bg-[#121212] text-gray-300',
  };

  const activeThemeClass = mounted ? themeClasses[theme] : themeClasses.light;
  const prevChapterId = chapter?.prevChapterId;
  const nextChapterId = chapter?.nextChapterId;

  const canDelete = user && (user.role === 'ADMIN' || user.role === 'AUTHOR');

  return (
    <div className={`fixed inset-0 z-[90] w-full h-full overflow-y-auto transition-colors duration-300 ${activeThemeClass}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 min-h-screen">

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href={`/novels/${novelId}`} className="text-sm font-medium opacity-70 hover:opacity-100 flex items-center gap-1 transition-opacity">
            &larr; До новели
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {allChapters && allChapters.length > 0 && (
              <select
                className="bg-transparent border border-gray-300 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
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

            {user && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm font-medium transition flex-shrink-0 flex items-center gap-1"
                title="Повідомити про помилку"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="hidden sm:inline">Скарга</span>
              </button>
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
          <h1 className={`text-3xl sm:text-4xl font-extrabold mb-12 text-center leading-tight ${mounted && theme === 'dark' ? 'text-gray-100' : 'text-slate-900'}`}>
            Розділ {chapter.order}: {chapter.title}
          </h1>

          <div
            className={`prose prose-lg max-w-none prose-headings:font-bold reader-content leading-relaxed ${
              mounted && theme === 'dark' ? 'prose-invert' : ''
            }`}
            style={{ fontSize: mounted ? `${fontSize}px` : '18px' }}
            dangerouslySetInnerHTML={{ __html: chapter.content }}
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
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetId={chapterId}
          targetType="CHAPTER"
        />
      </div>
    </div>
  );
};