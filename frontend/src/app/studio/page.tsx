import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Студія Автора | NovelHub',
};

export default function StudioDashboard() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Студія Автора</h1>
          <p className="text-gray-600 mt-1">Керуйте своїми історіями та публікаціями</p>
        </div>

        <Link
          href="/studio/novels/create"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Створити новелу
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">У вас ще немає творів</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Почніть свою письменницьку подорож прямо зараз. Створіть першу новелу, додайте розділи та поділіться нею з читачами.
        </p>
        {/* У майбутньому тут буде рендеритись <AuthorNovelList /> замість цієї заглушки */}
      </div>
    </div>
  );
}