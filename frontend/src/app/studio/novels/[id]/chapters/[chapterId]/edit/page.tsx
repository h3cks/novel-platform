'use client';

import { useQuery } from '@tanstack/react-query';
import { ChapterForm } from '@/features/studio/components/ChapterForm';
import { studioChaptersService } from '@/features/studio/api/studio-chapters.service';
import Link from 'next/link';

export default function EditChapterPage({ params }: { params: { id: string; chapterId: string } }) {
  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ['chapter', params.chapterId],
    queryFn: () => studioChaptersService.getChapterById(params.chapterId),
  });

  if (isLoading) return <div className="text-center mt-20 text-gray-500">Завантаження розділу...</div>;
  if (error || !chapter) return <div className="text-center mt-20 text-red-500">Помилка завантаження</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link href={`/studio/novels/${params.id}`} className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
          &larr; Назад до управління новелою
        </Link>
      </div>
      <ChapterForm novelId={params.id} chapterId={params.chapterId} initialData={chapter} />
    </div>
  );
}