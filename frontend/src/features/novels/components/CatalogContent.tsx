'use client';

import { useNovels } from '../hooks/useNovels';
import { NovelList } from './NovelList';

export const CatalogContent = () => {
  // Використовуємо ваш хук для отримання даних
  const { data, isLoading, isError } = useNovels();

  if (isLoading) {
    return <div className="text-center text-slate-500 py-10">Завантаження каталогу...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Помилка завантаження новел.</div>;
  }

  // Передаємо дані з React Query у ваш NovelList
  return <NovelList novels={data} />;
};