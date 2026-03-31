import type { Metadata } from 'next';
import { ChapterForm } from '@/features/studio/components/ChapterForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Написати розділ | Студія NovelHub',
};

export default function CreateChapterPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link href={`/studio/novels/${params.id}`} className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
          &larr; Назад до управління новелою
        </Link>
      </div>
      <ChapterForm novelId={params.id} />
    </div>
  );
}