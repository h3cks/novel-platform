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
      <div className="flex flex-col md:flex-row gap-8 animate-pulse bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-full md:w-72 aspect-[2/3] bg-slate-200 rounded-xl shrink-0"></div>
        <div className="flex-1 space-y-4 pt-2">
          <div className="h-10 bg-slate-200 rounded-lg w-3/4"></div>
          <div className="h-6 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
          </div>
          <div className="space-y-3 mt-8">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !novel) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Новелу не знайдено</h3>
        <p className="text-slate-500 mb-6">Можливо, вона була видалена або сталася помилка.</p>
        <Link href="/novels" className="text-primary-600 font-semibold hover:underline">
          &larr; Повернутися до каталогу
        </Link>
      </div>
    );
  }

  const coverImage = novel.coverUrl || 'https://placehold.co/400x600/e2e8f0/64748b?text=No+Cover';

  const statusConfig: Record<NovelStatus, { label: string; color: string }> = {
    DRAFT: { label: 'Чернетка', color: 'bg-slate-100 text-slate-700' },
    REVIEWING: { label: 'На перевірці', color: 'bg-amber-100 text-amber-800' },
    PUBLISHED: { label: 'Опубліковано', color: 'bg-emerald-100 text-emerald-800' },
    BLOCKED: { label: 'Заблоковано', color: 'bg-red-100 text-red-800' },
  };

  const currentStatus = statusConfig[novel.status] || statusConfig.DRAFT;

  return (
    <div className="space-y-8">
      {/* Основна інформація */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Обкладинка та кнопки */}
          <div className="w-full md:w-72 shrink-0 flex flex-col gap-6">
            <div className="w-full aspect-[2/3] relative rounded-2xl overflow-hidden shadow-md bg-slate-100 border border-slate-200">
              <img
                src={coverImage}
                alt={`Обкладинка ${novel.title}`}
                className="w-full h-full object-cover"
              />
            </div>
            <Link
              href={`/novels/${novel.id}/chapters`}
              className="w-full bg-primary-600 text-white text-center py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Почати читати
            </Link>
          </div>

          {/* Деталі */}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {novel.title}
            </h1>
            <div className="text-lg text-slate-600 mb-6 flex items-center gap-2">
              <span>Автор:</span>
              <Link href={`/profile/${novel.authorId}`} className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                {novel.author?.username || `User #${novel.authorId}`}
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
              <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-bold tracking-wide">
                {novel.wordCount ? `${(novel.wordCount / 1000).toFixed(1)}k слів` : '0 слів'}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                Опис
              </h3>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                {novel.description || <span className="text-slate-400 italic">Автор ще не додав опис до цієї новели.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Коментарі (Тепер на повну ширину!) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10">
        <CommentSection novelId={novelId} />
      </div>
    </div>
  );
};