'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CatalogContent } from '@/features/novels/components/CatalogContent';
import { Suspense } from 'react';

export default function NovelsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (key: string, value: string) => {

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Suspense fallback={<div>Завантаження каталогу...</div>}>
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
          <h2 className="font-bold text-lg text-slate-900 mb-4">Фільтри</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Статус</h3>
              <select
                onChange={(e) => handleFilterChange('status', e.target.value)}
                value={searchParams.get('status') || ''}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2"
              >
                <option value="">Всі</option>
                <option value="PUBLISHED">Опубліковано</option>
                <option value="ONGOING">В процесі</option>
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Сортування</h3>
              <select
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                value={searchParams.get('sort') || 'latest'}
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2"
              >
                <option value="latest">Останні оновлення</option>
                <option value="popular">Найпопулярніші</option>
                <option value="alphabetical">За алфавітом</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Каталог новел</h1>
        </div>
        <CatalogContent filters={{
          status: searchParams.get('status'),
          sort: searchParams.get('sort'),
          page: searchParams.get('page')
        }} />
      </section>
    </div>
    </Suspense>
  );
}