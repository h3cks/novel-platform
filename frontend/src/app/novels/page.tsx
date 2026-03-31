import type { Metadata } from 'next';
import { NovelList } from '@/features/novels/components/NovelList';

export const metadata: Metadata = {
  title: 'Каталог | NovelHub',
};

export default function NovelsPage() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar (Фільтри) */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
          <h2 className="font-bold text-lg text-slate-900 mb-4">Фільтри</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Статус</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-600">В процесі</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm text-slate-600">Завершено</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Сортування</h3>
              <select className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Останні оновлення</option>
                <option>Найпопулярніші</option>
                <option>За алфавітом</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Головний контент (Список) */}
      <section className="flex-1">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Каталог новел</h1>
            <p className="text-slate-500 mt-1">Знайдіть свою наступну улюблену історію</p>
          </div>
        </div>

        <NovelList />
      </section>
    </div>
  );
}