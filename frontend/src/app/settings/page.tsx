import type { Metadata } from 'next';
import { SettingsForm } from '@/features/profile/components/SettingsForm';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Налаштування | NovelHub',
};

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
        <SettingsForm />
      </div>
    </ProtectedRoute>
  );
}