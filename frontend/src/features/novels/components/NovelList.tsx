'use client';

import { NovelCard } from './NovelCard';
import { Novel } from '../types';

interface NovelListProps {
  // Робимо тип трохи гнучкішим, щоб прийняти об'єкт пагінації, якщо він випадково сюди потрапить
  novels: Novel[] | any;
}

export const NovelList = ({ novels }: NovelListProps) => {

  const novelsArray = Array.isArray(novels)
    ? novels
    : novels?.items || novels?.data?.items || [];


  if (!novelsArray || novelsArray.length === 0) {
    return <div className="text-center text-slate-500 py-10">Новел не знайдено.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {novelsArray.map((novel: Novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  );
};