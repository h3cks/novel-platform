import Link from 'next/link';
import { Novel } from '../types';

interface NovelCardProps {
  novel: Novel;
}

export const NovelCard = ({ novel }: NovelCardProps) => {
  const coverImage = novel.coverUrl || 'https://placehold.co/400x600/e2e8f0/64748b?text=No+Cover';

  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100 border border-slate-100 overflow-hidden transition-all duration-300">
      <Link href={`/novels/${novel.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 block">
        {/* Статус бейдж */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg tracking-wide">
            {novel.status === 'PUBLISHED' ? 'Опубліковано' : 'В процесі'}
          </span>
        </div>
        {/* Обкладинка з ефектом зуму */}
        <img
          src={coverImage}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/novels/${novel.id}`}>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight mb-1">
            {novel.title}
          </h3>
        </Link>

        {novel.author && (
          <p className="text-sm text-slate-500 mb-3 font-medium">
            {novel.author.username}
          </p>
        )}

        <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">
          {novel.description || 'Опис відсутній...'}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            {novel.wordCount ? `${(novel.wordCount / 1000).toFixed(1)}k слів` : '0 слів'}
          </span>
        </div>
      </div>
    </div>
  );
};