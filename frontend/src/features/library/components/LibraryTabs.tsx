'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryService } from '../api/library.service';
import { BookmarkItem } from './BookmarkItem';

export const LibraryTabs = () => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const queryClient = useQueryClient();

  // Отримання закладок
  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ['library', 'bookmarks'],
    queryFn: libraryService.getBookmarks,
    enabled: activeTab === 'bookmarks',
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
        {activeTab === 'bookmarks' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoadingBookmarks ? (
              <p className="text-slate-500">Завантаження...</p>
            ) : !bookmarks || bookmarks.length === 0 ? (
              <p className="text-slate-500 col-span-2">Ваша бібліотека порожня.</p>
            ) : (
              bookmarks.map((b) => (
                <BookmarkItem key={b.id} bookmark={b} onRemove={(id) => removeMutation.mutate(id)} />
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-slate-500">
            Функціонал історії читання в процесі розробки...
          </div>
        )}
      </div>
    </div>
  );
};