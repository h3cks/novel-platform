'use client';

import { useNovels } from '../hooks/useNovels';
import { NovelCard } from './NovelCard';

export const NovelList = () => {
  const { data: novels, isLoading, isError, error } = useNovels();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-4 h-96 border border-gray-100 shadow-sm flex flex-col">
            <div className="bg-gray-200 h-64 w-full rounded-md mb-4"></div>
            <div className="bg-gray-200 h-6 w-3/4 mb-2 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/2 mb-4 rounded"></div>
            <div className="bg-gray-200 flex-grow rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
        <h3 className="text-lg font-medium text-red-600 mb-2">Помилка завантаження каталогу</h3>
        <p className="text-red-500 text-sm">{(error as any)?.message || 'Спробуйте оновити сторінку.'}</p>
      </div>
    );
  }

  if (!novels || novels.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium text-gray-600 mb-2">Каталог порожній</h3>
        <p className="text-gray-500 text-sm">Наразі немає доступних новел для читання.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {novels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} />
      ))}
    </div>
  );
};