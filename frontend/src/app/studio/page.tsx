import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthorNovelList } from '@/features/studio/components/AuthorNovelList'; // ДОДАНО ІМПОРТ

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
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
        >
          + Створити новелу
        </Link>
      </div>

      <AuthorNovelList />
    </div>
  );
}