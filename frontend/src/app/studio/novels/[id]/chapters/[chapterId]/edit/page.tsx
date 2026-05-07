'use client';

import { useQuery } from '@tanstack/react-query';
import { ChapterForm } from '@/features/studio/components/ChapterForm';
import { studioChaptersService } from '@/features/studio/api/studio-chapters.service';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditChapterPage() {
  const params = useParams();
  const novelId = params.id as string;
  const chapterId = params.chapterId as string;
  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ['chapter', params.id, params.chapterId],
    queryFn: () => studioChaptersService.getChapterById(novelId , chapterId),
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
      <ChapterForm novelId={novelId} chapterId={chapterId} initialData={chapter} />
    </div>
  );
}