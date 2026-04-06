'use client';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LibraryTabs } from '@/features/library/components/LibraryTabs';

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <div className="py-8">
        <LibraryTabs />
      </div>
    </ProtectedRoute>
  );
}