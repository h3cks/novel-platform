import type { Metadata } from 'next';
import { ProfileLayout } from '@/features/profile/components/ProfileLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Мій Профіль | NovelHub',
  description: 'Особистий кабінет користувача NovelHub',
};

export default function ProfilePage() {
  return (
    // ProtectedRoute перенаправить на сторінку логіну, якщо токена немає
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-8">
        <ProfileLayout />
      </div>
    </ProtectedRoute>
  );
}