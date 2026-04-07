'use client';

import { NovelCard } from '@/features/novels/components/NovelCard';
import { Novel } from '@/features/novels/types';

interface NovelCarouselProps {
  title: string;
  novels: Novel[] | undefined;
  isLoading: boolean;
  linkTo?: string; // Посилання на "Дивитись всі"
}

export const NovelCarousel = ({ title, novels, isLoading, linkTo }: NovelCarouselProps) => {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-0">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {linkTo && (
          <a href={linkTo} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Дивитись всі &rarr;
          </a>
        )}
      </div>

      {isLoading ? (
        // Скелетон завантаження
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-0 hide-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-[160px] min-w-[160px] sm:w-[180px] sm:min-w-[180px] animate-pulse">
              <div className="aspect-[2/3] bg-slate-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : novels && novels.length > 0 ? (
        // Контейнер з горизонтальним скролом
        <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-6 px-4 sm:px-0 snap-x snap-mandatory hide-scrollbar">
          {novels.map((novel) => (
            <div key={novel.id} className="snap-start">
              <NovelCard novel={novel} layout="carousel" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 px-4 sm:px-0">Немає новел для відображення.</p>
      )}
    </section>
  );
};