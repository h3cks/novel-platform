import type { Metadata } from 'next';
import { NovelForm } from '@/features/studio/components/NovelForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Створити новелу | Студія NovelHub',
};

export default function CreateNovelPage() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <Link href="/studio" className="text-blue-600 hover:underline text-sm font-medium">
          &larr; Назад до студії
        </Link>
      </div>
      <NovelForm />
    </div>
  );
}