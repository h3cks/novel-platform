'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminContentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'novels' | 'genres' | 'tags'>('novels');
  const [page, setPage] = useState(1);
  const limit = 20;

  // ==========================================
  // 1. ДАНІ ТА МУТАЦІЇ ДЛЯ НОВЕЛ
  // ==========================================
  const { data: novelsData, isLoading: novelsLoading } = useQuery({
    queryKey: ['admin-novels', page],
    queryFn: () => adminService.getNovels(page, limit),
    enabled: activeTab === 'novels',
  });

  const blockNovelMutation = useMutation({
    mutationFn: ({ id, flagged }: { id: number; flagged: boolean }) =>
      adminService.blockNovel(id, !flagged, !flagged ? 'rule violation' : 'unblock'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-novels'] });
      toast.success('Статус новели змінено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при зміні статусу');
    }
  });

  // ==========================================
  // 2. ДАНІ ТА МУТАЦІЇ ДЛЯ ЖАНРІВ
  // ==========================================
  const [newGenre, setNewGenre] = useState({ name: '', description: '' });

  const { data: genresData } = useQuery({
    queryKey: ['admin-genres'],
    queryFn: adminService.getGenres,
    enabled: activeTab === 'genres',
  });


  const createGenreMutation = useMutation({
    mutationFn: () => adminService.createGenre(newGenre.name, newGenre.description),
    onSuccess: () => {
      setNewGenre({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
      toast.success('Жанр створено');
    },
    onError: (error: any) => {
      // Виводимо в консоль F12 ВСЮ помилку, щоб ви могли її роздивитись
      console.error("ДЕТАЛІ ПОМИЛКИ:", error);

      // Намагаємось дістати повідомлення з усіх можливих місць
      const errorMessage =
        error?.response?.data?.message || // Якщо бекенд повернув нашу кастомну помилку
        error?.response?.data?.error ||   // Якщо бекенд повернув стандартну помилку Prisma/Express
        error?.message ||                 // Системна помилка Axios (наприклад "Network Error")
        'Сталася невідома помилка';

      toast.error(errorMessage);
    }
  });

  const deleteGenreMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteGenre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] });
      toast.success('Жанр видалено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні жанру');
    }
  });

  // ==========================================
  // 3. ДАНІ ТА МУТАЦІЇ ДЛЯ ТЕГІВ
  // ==========================================
  const [newTag, setNewTag] = useState('');

  const { data: tagsData } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: adminService.getTags,
    enabled: activeTab === 'tags',
  });

  const createTagMutation = useMutation({
    mutationFn: () => adminService.createTag(newTag),
    onSuccess: () => {
      setNewTag('');
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Тег створено');
    },
    onError: (error: any) => {
      console.error("ДЕТАЛІ ПОМИЛКИ:", error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Сталася невідома помилка';
      toast.error(errorMessage);
    }
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      toast.success('Тег видалено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні тегу');
    }
  });

  const deleteNovelMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteNovel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-novels'] });
      toast.success('Новелу назавжди видалено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управління контентом</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['novels', 'genres', 'tags'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'novels' ? 'Новели' : tab === 'genres' ? 'Жанри' : 'Теги'}
          </button>
        ))}
      </div>

      {/* ======================= Вкладка: НОВЕЛИ ======================= */}
      {activeTab === 'novels' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {novelsLoading ? (
            <div className="p-8 text-center text-gray-400">Завантаження...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-600">
              <tr>
                <th className="px-6 py-4">Назва</th>
                <th className="px-6 py-4">Автор</th>
                <th className="px-6 py-4">Розділів</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
              {novelsData?.novels.map((novel: any) => (
                <tr key={novel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    <Link href={`/admin/content/novels/${novel.id}`} className="text-indigo-600 hover:underline">
                      {novel.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{novel.author.username}</td>
                  <td className="px-6 py-4 text-gray-500">{novel._count.chapters}</td>
                  <td className="px-6 py-4">
                    {novel.flagged ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Заблоковано</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Активна</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap space-x-3">
                    <button
                      onClick={() => blockNovelMutation.mutate({ id: novel.id, flagged: novel.flagged })}
                      className={`text-xs font-bold ${novel.flagged ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'} transition`}
                    >
                      {novel.flagged ? 'Розблокувати' : 'Приховати'}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Видалити новелу "${novel.title}" назавжди? Усі її розділи та коментарі будуть знищені!`)) {
                          deleteNovelMutation.mutate(novel.id);
                        }
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-800 transition"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>


          )}

          {/* Пагінація для Новел */}
          <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-100">
            <button
              disabled={page === 1 || novelsLoading}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Назад
            </button>
              <span className="text-sm font-medium text-gray-600">
                Сторінка {page} з {novelsData ? Math.max(1, Math.ceil(novelsData.total / limit)) : 1}
              </span>
              <button
                disabled={!novelsData || page >= Math.ceil(novelsData.total / limit) || novelsLoading}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
              Вперед
            </button>
          </div>
        </div>
      )}

      {/* ======================= Вкладка: ЖАНРИ ======================= */}
      {activeTab === 'genres' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Ліва колонка: Створення */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Створити новий жанр</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                <input
                  type="text"
                  value={newGenre.name}
                  onChange={(e) => setNewGenre({ ...newGenre, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Наприклад: Фентезі"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                <textarea
                  value={newGenre.description}
                  onChange={(e) => setNewGenre({ ...newGenre, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="Короткий опис жанру..."
                />
              </div>
              <button
                onClick={() => createGenreMutation.mutate()}
                disabled={!newGenre.name || createGenreMutation.isPending}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                {createGenreMutation.isPending ? 'Створення...' : 'Створити жанр'}
              </button>
            </div>
          </div>

          {/* Права колонка: Список */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Існуючі жанри</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {genresData?.length === 0 && <p className="text-gray-400 text-sm">Жанрів ще немає</p>}
              {genresData?.map((genre: any) => (
                <div key={genre.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{genre.name}</span>
                    <span className="ml-2 text-xs text-gray-400">({genre._count?.novels || 0} новел)</span>
                  </div>
                  <button
                    onClick={() => { if(confirm('Ви впевнені, що хочете видалити цей жанр?')) deleteGenreMutation.mutate(genre.id) }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Видалити"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================= Вкладка: ТЕГИ ======================= */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Ліва колонка: Створення */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Додати новий тег</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Назва тегу</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Наприклад: Сильна героїня"
                />
              </div>
              <button
                onClick={() => createTagMutation.mutate()}
                disabled={!newTag || createTagMutation.isPending}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                {createTagMutation.isPending ? 'Створення...' : 'Створити тег'}
              </button>
            </div>
          </div>

          {/* Права колонка: Список */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Існуючі теги</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {tagsData?.length === 0 && <p className="text-gray-400 text-sm">Тегів ще немає</p>}
              {tagsData?.map((tag: any) => (
                <div key={tag.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{tag.name}</span>
                    <span className="ml-2 text-xs text-gray-400">({tag._count?.novels || 0} новел)</span>
                  </div>
                  <button
                    onClick={() => { if(confirm('Ви впевнені, що хочете видалити цей тег?')) deleteTagMutation.mutate(tag.id) }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Видалити"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}