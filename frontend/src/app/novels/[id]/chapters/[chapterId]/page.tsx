'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { useReaderStore } from '@/store/useReaderStore';
import { CommentSection } from '@/features/comments/components/CommentSection';

export default function ChapterReader() {
  const params = useParams();
  const router = useRouter();

  // Дістаємо налаштування з Zustand
  const { fontSize, theme, setFontSize, setTheme } = useReaderStore();

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', params.chapterId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/chapters/${params.chapterId}`);
      return data.data;
    }
  });

  // Визначаємо стилі залежно від обраної теми
  const themeStyles = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-200',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]',
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center">Завантаження розділу...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeStyles[theme]} py-8`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Панель інструментів (Toolbar) */}
        <div className="flex flex-wrap justify-between items-center mb-8 pb-4 border-b border-gray-200/20">
          <button onClick={() => router.push(`/novels/${params.id}`)} className="text-sm hover:underline opacity-80">
            ← Назад до новели
          </button>

          <div className="flex items-center gap-4 bg-black/5 p-2 rounded-lg backdrop-blur-sm">
            {/* Кнопки вибору теми */}
            <div className="flex gap-2">
              <button onClick={() => setTheme('light')} className={`w-6 h-6 rounded-full border bg-white ${theme === 'light' ? 'ring-2 ring-blue-500' : ''}`} title="Світла тема" />
              <button onClick={() => setTheme('sepia')} className={`w-6 h-6 rounded-full border bg-[#f4ecd8] ${theme === 'sepia' ? 'ring-2 ring-blue-500' : ''}`} title="Сепія" />
              <button onClick={() => setTheme('dark')} className={`w-6 h-6 rounded-full border bg-gray-900 ${theme === 'dark' ? 'ring-2 ring-blue-500' : ''}`} title="Темна тема" />
            </div>

            <div className="w-px h-6 bg-gray-300/50" /> {/* Роздільник */}

            {/* Кнопки розміру шрифту */}
            <div className="flex items-center gap-3 font-medium">
              <button onClick={() => setFontSize(fontSize - 2)} className="hover:opacity-70 px-2">A-</button>
              <span className="text-sm opacity-80">{fontSize}px</span>
              <button onClick={() => setFontSize(fontSize + 2)} className="hover:opacity-70 px-2 text-lg">A+</button>
            </div>
          </div>
        </div>

        {/* Контент розділу */}
        <article>
          <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center leading-tight">
            {chapter?.title}
          </h1>

          <div
            className="font-serif leading-relaxed"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: chapter?.content || '' }}
          />
        </article>

        {/* Навігація між розділами (Заглушка для майбутнього) */}
        <div className="flex justify-between mt-16 pt-8 border-t border-gray-200/20">
          <button className="px-6 py-2 border rounded-md hover:bg-black/5 transition opacity-80">Попередній розділ</button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Наступний розділ</button>
        </div>

        {/* Секція коментарів (вона має успадкувати тему або мати власну нейтральну) */}
        <div className="mt-16">
          <CommentSection chapterId={Number(params.chapterId)} />
        </div>
      </div>
    </div>
  );
}