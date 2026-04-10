import type { Metadata } from 'next';
import { ReportList } from '@/features/reports/components/ReportList';

export const metadata: Metadata = {
  title: 'Модерація скарг | Admin NovelHub',
};

export default function AdminReportsPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Центр Модерації</h1>
        <p className="text-gray-600 mt-2">Управління скаргами користувачів на контент</p>
      </div>

      <ReportList />
    </div>
  );
}