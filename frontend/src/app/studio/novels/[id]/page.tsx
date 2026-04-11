'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { studioChaptersService } from '@/features/studio/api/studio-chapters.service';
import { usePublishNovel } from '@/features/studio/hooks/usePublishNovel';

export default function StudioNovelDashboard() {
  const params = useParams();
  const novelId = params.id as string;

  const { data: chapters, isLoading } = useQuery({
    queryKey: ['novel-chapters', novelId],
    queryFn: () => studioChaptersService.getNovelChapters(novelId),
  });

  // Додаємо хук публікації
  const { mutate: publishNovel, isPending: isPublishing, error: publishError } = usePublishNovel();

  const handlePublish = () => {
    publishNovel(novelId);
  };

  const error = publishError as any;
  const apiErrorDetails = error?.response?.data?.error;
  let errorMessage = apiErrorDetails?.message || error?.message || 'Помилка при публікації.';

  // Розшифровуємо деталі помилки від бекенду (з publish.service.ts)
  if (apiErrorDetails?.details?.reasons?.includes('min_words_total')) {
    const { required, actual } = apiErrorDetails.details.details;
    errorMessage = `Недостатньо слів для публікації. Потрібно мінімум ${required}, а у вас всього ${actual}.`;
  } else if (apiErrorDetails?.details?.reasons?.includes('no_genre')) {
    errorMessage = `Додайте хоча б один жанр у налаштуваннях новели перед публікацією.`;
  }
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-gray-100">

      {publishError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Управління новелою</h1>
          <p className="text-sm text-gray-500 mt-1">ID новели: {novelId}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/studio" className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm">
            Назад
          </Link>
          <Link href={`/studio/novels/${novelId}/edit`} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
            Налаштування
          </Link>

          {/* Кнопка публікації */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm text-sm disabled:opacity-50"
          >
            {isPublishing ? 'Публікація...' : 'Опублікувати'}

          </button>

          <Link href={`/studio/novels/${novelId}/chapters/create`} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm">
            + Новий розділ
          </Link>
        </div>
      </div>

      {/* ДИНАМІЧНИЙ СПИСОК РОЗДІЛІВ */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Список розділів</h2>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500 animate-pulse">Завантаження розділів...</div>
        ) : chapters && chapters.length > 0 ? (
          <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {chapters.map((chapter: any, index: number) => (
              <li key={chapter.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-lg">
                    <span className="text-gray-400 mr-2">#{chapter.order || index + 1}</span>
                    {chapter.title}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    ID: {chapter.id} • Слів: {chapter.wordCount || 0} • Створено: {new Date(chapter.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/studio/novels/${novelId}/chapters/${chapter.id}/edit`}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Редагувати
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
            <h3 className="text-lg font-bold text-slate-700 mb-1">Немає розділів</h3>
            <p className="text-sm text-slate-500">Додай перший розділ, щоб читачі могли почати читати.</p>
          </div>
        )}
      </div>
    </div>
  );
}