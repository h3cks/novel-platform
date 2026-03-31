'use client';

import Link from 'next/link';
import { useNovel } from '../hooks/useNovels';
import { NovelStatus } from '../types';
import { CommentSection } from '@/features/comments/components/CommentSection';

interface NovelDetailsProps {
  novelId: string;
}

export const NovelDetails = ({ novelId }: NovelDetailsProps) => {
  const { data: novel, isLoading, isError } = useNovel(novelId);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-8 animate-pulse">
        <div className="w-full md:w-72 h-96 bg-gray-200 rounded-lg shrink-0"></div>
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-2 mt-8">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !novel) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-lg border border-red-100">
        <h3 className="text-xl font-medium text-red-600 mb-2">Новелу не знайдено</h3>
        <p className="text-red-500 mb-6">Можливо, вона була видалена або сталася помилка сервера.</p>
        <Link href="/novels" className="text-blue-600 hover:underline">
          &larr; Повернутися до каталогу
        </Link>
      </div>
    );
  }

  const coverImage = novel.coverUrl || '/placeholder-cover.jpg';

  // Явна типізація статусів за допомогою Record
  const statusConfig: Record<NovelStatus, { label: string; color: string }> = {
    DRAFT: { label: 'Чернетка', color: 'bg-gray-100 text-gray-800' },
    REVIEWING: { label: 'На перевірці', color: 'bg-yellow-100 text-yellow-800' },
    PUBLISHED: { label: 'Опубліковано', color: 'bg-green-100 text-green-800' },
    BLOCKED: { label: 'Заблоковано', color: 'bg-red-100 text-red-800' },
  };

  const currentStatus = statusConfig[novel.status] || statusConfig.DRAFT;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Left Column: Cover & Actions */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden border border-gray-200 shadow-md">
            <img
              src={coverImage}
              alt={`Обкладинка ${novel.title}`}
              className="w-full h-full object-cover"
            />
          </div>

          <Link
            href={`/novels/${novel.id}/chapters`}
            className="w-full bg-blue-600 text-white text-center py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Почати читати
          </Link>
        </div>

        {/* Right Column: Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            {novel.title}
          </h1>

          <div className="text-lg text-gray-600 mb-6">
            Автор: <Link href={`/profile/${novel.authorId}`} className="font-medium text-blue-600 hover:underline">
            {novel.author?.username || `User #${novel.authorId}`}
          </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              Слів: {novel.wordCount ? novel.wordCount.toLocaleString('uk-UA') : '0'}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Опис</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {novel.description || <span className="text-gray-400 italic">Автор ще не додав опис до цієї новели.</span>}
            </div>
          </div>
          <CommentSection novelId={novelId} />
        </div>

      </div>
    </div>
  );
};