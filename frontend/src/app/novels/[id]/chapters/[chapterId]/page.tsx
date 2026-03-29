'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { chaptersService } from '@/features/chapters/api/chapters.service';
import { useReaderStore } from '@/store/useReaderStore';
import Link from 'next/link';
import { CommentSection } from '@/features/comments/components/CommentSection';

export default function ChapterReaderPage() {
  const { id: novelId, chapterId } = useParams();
  const router = useRouter();

  const { fontSize, theme, setFontSize, setTheme } = useReaderStore();

  const { data: chapter, isLoading, isError } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => chaptersService.getChapterById(chapterId as string),
    enabled: !!chapterId,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Завантаження тексту...</div>;
  if (isError || !chapter) return <div className="min-h-screen flex items-center justify-center text-red-500">Розділ не знайдено.</div>;

  // Визначаємо стилі залежно від обраної теми
  const themeClasses = {
    light: 'bg-white text-slate-900',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
    dark: 'bg-slate-900 text-slate-300',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses[theme]}`}>
      {/* Верхня панель інструментів */}
      <div className="sticky top-0 z-10 border-b border-opacity-10 shadow-sm backdrop-blur-md bg-inherit">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Link href={`/novels/${novelId}`} className="text-sm font-medium hover:underline opacity-80">
            ← Повернутися до книги
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex bg-black/5 rounded-lg p-1">
              <button onClick={() => setTheme('light')} className={`px-2 py-1 rounded ${theme === 'light' ? 'bg-white shadow' : ''}`}>☀️</button>
              <button onClick={() => setTheme('sepia')} className={`px-2 py-1 rounded ${theme === 'sepia' ? 'bg-[#e4dcc4] shadow' : ''}`}>📖</button>
              <button onClick={() => setTheme('dark')} className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-slate-700 shadow text-white' : ''}`}>🌙</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center">A-</button>
              <span className="w-6 text-center">{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(30, fontSize + 2))} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center">A+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Текст розділу */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-12 text-center text-3xl font-bold md:text-4xl leading-tight">
          {chapter.title}
        </h1>

        <div
          className="whitespace-pre-wrap leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter.content}
        </div>

        {/* Навігація внизу (Заглушка для майбутньої пагінації) */}
        <div className="mt-16 border-t border-opacity-10 pt-8 flex justify-between">
          <button className="px-4 py-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
            ← Попередній розділ
          </button>
          <button className="px-4 py-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
            Наступний розділ →
          </button>
        </div>
        <CommentSection chapterId={chapter.id} />
      </main>
    </div>
  );
}