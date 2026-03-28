'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import Link from 'next/link';
import { CommentSection } from '@/features/comments/components/CommentSection';
import { ReportModal } from '@/features/reports/components/ReportModal';
import { useState } from 'react';

export default function NovelDetailsPage() {
  const params = useParams();
  const novelId = Number(params.id);
  const [isReportOpen, setReportOpen] = useState(false);

  const { data: novel, isLoading: isNovelLoading } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/novels/${novelId}`);
      return data.data;
    }
  });

  const { data: chapters, isLoading: isChaptersLoading } = useQuery({
    queryKey: ['chapters', 'novel', novelId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/chapters/novel/${novelId}`);
      return data.data;
    }
  });

  if (isNovelLoading) return <div className="text-center py-20">Завантаження новели...</div>;
  if (!novel) return <div className="text-center py-20 text-red-500">Новелу не знайдено</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 mb-12 bg-white p-6 rounded-xl shadow-sm border relative">
        <button onClick={() => setReportOpen(true)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-sm font-medium transition">
          Поскаржитися
        </button>

        <div className="w-full md:w-1/3">
          <img src={novel.coverUrl || 'https://via.placeholder.com/300x450?text=No+Cover'} alt={novel.title} className="w-full rounded-lg object-cover aspect-[2/3] shadow-md bg-gray-100" />
        </div>

        <div className="w-full md:w-2/3 flex flex-col">
          <h1 className="text-3xl font-extrabold mb-2 text-gray-900">{novel.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{novel.status}</span>
            <span>•</span>
            <span>Автор ID: {novel.authorId}</span>
          </div>

          <h3 className="font-semibold text-lg mb-2">Опис</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap flex-grow">{novel.description || 'Опис відсутній.'}</p>

          <div className="mt-6">
            {chapters?.[0] ? (
              <Link href={`/novels/${novel.id}/chapters/${chapters[0].id}`} className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                Почати читати
              </Link>
            ) : (
              <span className="text-gray-500 italic">Розділи ще не опубліковані</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Список розділів ({chapters?.length || 0})</h2>
        {isChaptersLoading ? (
          <div>Завантаження розділів...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border divide-y overflow-hidden">
            {chapters?.map((chapter: any) => (
              <Link key={chapter.id} href={`/novels/${novel.id}/chapters/${chapter.id}`} className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
                <span className="font-medium text-gray-900">Розділ {chapter.order}: {chapter.title}</span>
                <span className="text-sm text-gray-500">{new Date(chapter.createdAt).toLocaleDateString()}</span>
              </Link>
            ))}
            {chapters?.length === 0 && <div className="p-6 text-center text-gray-500">Розділів ще немає.</div>}
          </div>
        )}
      </div>

      <CommentSection novelId={novelId} />
      <ReportModal targetType="NOVEL" targetId={novelId} isOpen={isReportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}