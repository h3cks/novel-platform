'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNovel } from '../hooks/useNovels';
import { NovelStatus } from '../types';
import { CommentSection } from '@/features/comments/components/CommentSection';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCreateReport } from '@/features/reports/hooks/useCreateReport';

interface NovelDetailsProps {
  novelId: string;
}

export const NovelDetails = ({ novelId }: NovelDetailsProps) => {
  const { data: novel, isLoading, isError } = useNovel(novelId);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const { mutate: submitReport, isPending: isReporting } = useCreateReport();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Спам або реклама');
  const [reportDetail, setReportDetail] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl"></div>; // Скорочений лоадер для прикладу
  }

  if (isError || !novel) {
    return <div className="text-center py-16 text-red-500">Новелу не знайдено</div>;
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(
      { targetType: 'NOVEL', targetId: Number(novelId), reason: reportReason, detail: reportDetail },
      { onSuccess: () => setReportSuccess(true) }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Ліва колонка */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          <div className="w-full aspect-[2/3] rounded-lg overflow-hidden border border-gray-200">
            <img src={novel.coverUrl || '/placeholder-cover.jpg'} alt="Cover" className="w-full h-full object-cover" />
          </div>
          <Link href={`/novels/${novel.id}/chapters`} className="w-full bg-blue-600 text-white text-center py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors">
            Почати читати
          </Link>
        </div>

        {/* Права колонка */}
        <div className="flex-1 relative">
          {/* Кнопка скарги (тільки для авторизованих) */}
          {isAuthenticated && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
              title="Поскаржитись на контент"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
              <span className="hidden sm:inline">Поскаржитись</span>
            </button>
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 pr-24">{novel.title}</h1>
          <div className="text-lg text-gray-600 mb-6">
            Автор: <Link href={`/profile/${novel.authorId}`} className="font-medium text-blue-600 hover:underline">{novel.author?.username}</Link>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Опис</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-10">
              {novel.description || 'Опис відсутній.'}
            </div>
          </div>

          <CommentSection novelId={novelId} />
        </div>
      </div>

      {/* Модальне вікно скарги */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Поскаржитись на новелу</h3>
              <button onClick={() => { setIsReportModalOpen(false); setReportSuccess(false); }} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="p-6">
              {reportSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Скаргу відправлено</h4>
                  <p className="text-gray-500 mb-6">Дякуємо! Наші модератори перевірять цей контент найближчим часом.</p>
                  <button onClick={() => setIsReportModalOpen(false)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-200">Закрити</button>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Причина скарги</label>
                    <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Спам або реклама</option>
                      <option>Неприйнятний контент / 18+</option>
                      <option>Порушення авторських прав</option>
                      <option>Мова ворожнечі / Образи</option>
                      <option>Інше</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Деталі (необов'язково)</label>
                    <textarea value={reportDetail} onChange={(e) => setReportDetail(e.target.value)} rows={3} placeholder="Опишіть проблему детальніше..." className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">Скасувати</button>
                    <button type="submit" disabled={isReporting} className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50">
                      {isReporting ? 'Відправка...' : 'Відправити скаргу'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};