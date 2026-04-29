'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '../api/library.service';
import { BookmarkItem } from './BookmarkItem';
import Link from 'next/link';
import Image from 'next/image'; // Додали для обкладинок

export const LibraryTabs = () => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const queryClient = useQueryClient();

  // Отримання закладок
  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ['library', 'bookmarks'],
    queryFn: libraryService.getBookmarks,
    enabled: activeTab === 'bookmarks',
  });

  // Отримання історії читання
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['library', 'history'],
    queryFn: libraryService.getHistory,
    enabled: activeTab === 'history',
  });

  // Видалення закладки
  const removeMutation = useMutation({
    mutationFn: libraryService.removeBookmark,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library', 'bookmarks'] }),
  });

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Моя бібліотека</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'bookmarks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Збережене
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Історія читання
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* Скелетони завантаження */}
        {((isLoadingBookmarks && activeTab === 'bookmarks') || (isLoadingHistory && activeTab === 'history')) && (
          <div className="space-y-4 mt-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border border-slate-200 rounded-2xl bg-white">
                <div className="w-20 h-28 bg-slate-200 rounded-xl shrink-0"></div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded-lg w-28"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Відображення Закладок */}
        {!isLoadingBookmarks && activeTab === 'bookmarks' && (
          <div className="space-y-4 mt-6">
            {bookmarks?.length === 0 ? (
              <div className="text-center py-10 text-slate-500">У вас ще немає збережених новел.</div>
            ) : (
              bookmarks?.map((bookmark: any) => (
                <BookmarkItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  onRemove={(id) => removeMutation.mutate(id)}
                />
              ))
            )}
          </div>
        )}

        {/* Вкладка: Історія */}
        {!isLoadingHistory && activeTab === 'history' && (
          <div className="flex flex-col gap-3">
            {isLoadingHistory ? (
              <p className="text-slate-500 animate-pulse">Завантаження історії...</p>
            ) : !history || history.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500">Ви ще не читали жодної новели.</p>
                <Link href="/novels" className="text-indigo-600 font-semibold mt-2 inline-block hover:underline">
                  Перейти до каталогу
                </Link>
              </div>
            ) : (
              history.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/novels/${item.novelId}/chapters/${item.chapterId}`}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  {/* Обкладинка */}
                  <div className="w-12 h-16 bg-slate-100 rounded flex-shrink-0 overflow-hidden relative">
                    {item.novel.coverUrl ? (
                      <Image src={item.novel.coverUrl} alt="Cover" fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs text-center p-1">No Cover</div>
                    )}
                  </div>

                  {/* Інформація */}
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.novel.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Розділ {item.chapter.order}: {item.chapter.title}
                    </p>
                  </div>

                  {/* Час */}
                  <div className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(item.viewedAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};