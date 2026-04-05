'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudioNovelDashboard() {
  // Дістаємо ID новели з URL
  const params = useParams();
  const novelId = params.id;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Управління новелою</h1>
          <p className="text-sm text-gray-500 mt-1">ID новели: {novelId}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/studio"
            className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            Назад у студію
          </Link>

          <Link
            href={`/studio/novels/${novelId}/edit`}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            Редагувати новелу
          </Link>

          <Link
            href={`/studio/novels/${novelId}/chapters/create`}
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm"
          >
            + Новий розділ
          </Link>
        </div>
      </div>

      {/* Тимчасовий блок (тут пізніше буде список розділів) */}
      <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <h3 className="text-lg font-bold text-slate-700 mb-1">Немає розділів</h3>
        <p className="text-sm text-slate-500">Додай перший розділ, щоб читачі могли почати читати.</p>
      </div>
    </div>
  );
}