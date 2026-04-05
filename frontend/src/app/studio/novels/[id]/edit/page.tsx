'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { novelsService } from '@/features/novels/api/novels.service';
import { NovelForm } from '@/features/studio/components/NovelForm';

export default function EditNovelPage() {
  const params = useParams();
  const novelId = params.id as string;

  // Отримуємо існуючі дані новели з бекенду
  const { data: novel, isLoading, error } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: () => novelsService.getNovelById(novelId),
  });

  if (isLoading) {
    return <div className="text-center mt-20 text-gray-500 font-medium animate-pulse">Завантаження даних новели...</div>;
  }

  if (error || !novel) {
    return <div className="text-center mt-20 text-red-500 font-bold">Помилка завантаження новели.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* Передаємо initialData у нашу форму */}
      <NovelForm initialData={novel} novelId={novelId} />
    </div>
  );
}