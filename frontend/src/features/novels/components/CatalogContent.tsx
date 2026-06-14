'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useNovels } from '../hooks/useNovels';
import { NovelList } from './NovelList';

interface CatalogContentProps {
  filters?: {
    status?: string | null;
    sort?: string | null;
    page?: string | null;
  };
}

export const CatalogContent = ({ filters }: CatalogContentProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = filters?.page ? parseInt(filters.page, 10) : 1;
  const limit = 10;

  const { data, isLoading, isError } = useNovels({
    page,
    limit,
    status: filters?.status || 'PUBLISHED',
    sort: filters?.sort || undefined
  });

  const updatePageInUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const handleNext = () => updatePageInUrl(page + 1);
  const handlePrev = () => updatePageInUrl(Math.max(1, page - 1));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse mt-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-72 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Помилка завантаження новел.</div>;
  }

  const novelsArray = Array.isArray(data)
    ? data
    : data?.items || data?.data?.items || [];

  const totalItems = data?.total || data?.meta?.total;
  const hasMore = totalItems
    ? page * limit < totalItems
    : novelsArray.length === limit;

  return (
    <div className="space-y-8">
      <NovelList novels={novelsArray} />

      <div className="flex justify-center items-center gap-4 py-6 border-t border-slate-100 mt-8">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 hover:bg-slate-50 hover:text-indigo-600 transition-all font-semibold text-slate-700"
        >
          &larr; Попередня
        </button>
        <span className="text-slate-600 font-bold bg-slate-100 px-4 py-2 rounded-lg">
          Сторінка {page}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasMore}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 hover:bg-slate-50 hover:text-indigo-600 transition-all font-semibold text-slate-700"
        >
          Наступна &rarr;
        </button>
      </div>
    </div>
  );
};