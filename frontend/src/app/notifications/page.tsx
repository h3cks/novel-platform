import type { Metadata } from 'next';
import { NotificationList } from '@/features/notifications/components/NotificationList';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Сповіщення | NovelHub',
};

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Вхідні</h1>
        <NotificationList />
      </div>
    </ProtectedRoute>
  );
}