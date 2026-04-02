'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useChapter } from '../hooks/useChapter';
import { useReaderStore } from '@/store/useReaderStore';
import { ReaderSettings } from './ReaderSettings';
import { CommentSection } from '@/features/comments/components/CommentSection';
import DOMPurify from 'isomorphic-dompurify';

interface ReaderViewProps {
  novelId: string;
  chapterId: string;
}

export const ReaderView = ({ novelId, chapterId }: ReaderViewProps) => {
  const { data: chapter, isLoading, isError } = useChapter(novelId, chapterId);
  const { fontSize, theme } = useReaderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  // Визначаємо класи для теми
  const themeClasses = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-[#fcf8ef] text-[#5b4636]', // М'який колір для сепії
    dark: 'bg-[#121212] text-gray-300',
  };

  // Чекаємо на монтування клієнта, щоб застосувати збережену тему (уникаємо моргання)
  const activeThemeClass = mounted ? themeClasses[theme] : themeClasses.light;
  const prevChapterId = chapter?.prevChapterId;
  const nextChapterId = chapter?.nextChapterId;

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${activeThemeClass}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Хлібні крихти / Навігація */}
        <div className="mb-6">
          <Link
            href={`/novels/${novelId}`}
            className="text-sm font-medium opacity-70 hover:opacity-100 flex items-center gap-1 transition-opacity"
          >
            &larr; Назад до новели
          </Link>
        </div>

        <ReaderSettings />

        <article>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-12 text-center leading-tight">
            Розділ {chapter.order}: {chapter.title}
          </h1>

          <div
            className="prose prose-lg max-w-none prose-headings:font-bold reader-content leading-relaxed"
            style={{ fontSize: mounted ? `${fontSize}px` : '18px' }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapter.content) }}
          />
        </article>

        {/* Робоча навігація між розділами */}
        <div className="mt-16 pt-8 border-t border-gray-200/20 flex justify-between items-center">
          {prevChapterId ? (
            <Link
              href={`/novels/${novelId}/chapters/${prevChapterId}`}
              className="px-6 py-2 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition"
            >
              &larr; Попередній
            </Link>
          ) : (
            <div /> // Порожній блок для правильного вирівнювання через justify-between
          )}

          {nextChapterId ? (
            <Link
              href={`/novels/${novelId}/chapters/${nextChapterId}`}
              className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Наступний &rarr;
            </Link>
          ) : (
            <span className="text-gray-400 italic">Це останній розділ</span>
          )}
        </div>

        <CommentSection chapterId={chapterId} />
      </div>
    </div>
  );
};