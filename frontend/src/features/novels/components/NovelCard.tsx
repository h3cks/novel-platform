// src/features/novels/components/NovelCard.tsx
import Link from 'next/link';
import { Novel } from '../types';
import Image from 'next/image';

interface NovelCardProps {
  novel: Novel;
  layout?: 'grid' | 'carousel';
}

export const NovelCard = ({ novel, layout = 'grid' }: NovelCardProps) => {
  const coverImage = novel.coverUrl || 'https://placehold.co/400x600/e2e8f0/64748b?text=No+Cover';
  const isCarousel = layout === 'carousel';

  return (
    <div className={`group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100 border border-slate-100 overflow-hidden transition-all duration-300 ${
      isCarousel ? 'w-full h-full' : 'w-full'
    }`}>
      <Link href={`/novels/${novel.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 block">
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold rounded-lg tracking-wide">
            {novel.status === 'PUBLISHED' ? 'Опубліковано' : 'В процесі'}
          </span>
        </div>
        {/* ЗМІНЕНО: Використано оптимізований компонент Image */}
        <Image
          src={coverImage}
          alt={novel.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className={`p-3 sm:p-4 flex flex-col flex-grow ${isCarousel ? 'pb-3' : ''}`}>
        <Link href={`/novels/${novel.id}`}>
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight mb-1">
            {novel.title}
          </h3>
        </Link>

        {novel.author && (
          <Link href={`/users/${novel.author.id}`} className="text-xs sm:text-sm text-slate-500 hover:text-indigo-600 mb-2 font-medium transition-colors inline-block">
        {novel.author.username}
      </Link>
      )}

      {!isCarousel && (
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">
          {novel.description || 'Опис відсутній...'}
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            {novel.wordCount ? `${(novel.wordCount / 1000).toFixed(1)}k слів` : '0 слів'}
          </span>
      </div>
    </div>
</div>
);
};