'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { novelSchema, NovelFormValues } from '../schemas/novel.schema';
import { useCreateNovel } from '../hooks/useCreateNovel';
import Link from 'next/link';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { GenreSelector } from '@/components/ui/GenreSelector';
import { TagAutocomplete } from '@/components/ui/TagAutocomplete';
import { apiClient } from '@/lib/axios';

export const NovelForm = () => {
  const { mutate: createNovel, isPending, error } = useCreateNovel();

  // Стан для завантаження доступних жанрів з бекенду
  const [availableGenres, setAvailableGenres] = useState<{id: number, name: string}[]>([]);
  // Стан для відображення назв обраних тегів (бо форма зберігає лише ID)
  const [selectedTagObjects, setSelectedTagObjects] = useState<{id: number, name: string}[]>([]);

  useEffect(() => {
    // Додано правильний шлях: /meta/genres
    apiClient.get('/meta/genres')
      .then((res) => {
        // Увага: переконайся, що структура відповіді саме res.data.data.items
        // Якщо твоя утиліта ok() на бекенді повертає просто { items: [...] },
        // то тут має бути res.data.items
        setAvailableGenres(res.data.data?.items || res.data.items || []);
      })
      .catch((err) => {
        console.error("Помилка завантаження жанрів:", err);
      });
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<NovelFormValues>({
    resolver: zodResolver(novelSchema),
    defaultValues: {
      title: '',
      description: '',
      coverUrl: '',
      genreIds: [],
      tagIds: [],
    }
  });

  // Синхронізація об'єктів тегів з формою
  const handleTagsChange = (tags: {id: number, name: string}[]) => {
    setSelectedTagObjects(tags);
    setValue('tagIds', tags.map(t => t.id), { shouldValidate: true });
  };

  const onSubmit = (data: NovelFormValues) => {
    createNovel(data);
  };

  const apiError = error as any;
  const errorMessage = apiError?.response?.data?.message || 'Сталася помилка при збереженні.';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">Створення нової новели</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Ліва колонка: Обкладинка */}
        <div className="lg:col-span-1 space-y-3">
          <label className="block text-sm font-bold text-gray-700">Обкладинка</label>
          <Controller
            name="coverUrl"
            control={control}
            render={({ field: { onChange, value } }) => (
              <ImageUpload value={value} onChange={onChange} disabled={isPending} shape="rectangle" />
            )}
          />
        </div>

        {/* Права колонка: Основна інформація */}
        <div className="lg:col-span-2 space-y-8">
          {/* Назва */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Назва новели *</label>
            <input
              {...register('title')}
              disabled={isPending}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title.message}</p>}
          </div>

          {/* Жанри (Multi-select Pills) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Жанри (від 1 до 3) *
            </label>
            <Controller
              name="genreIds"
              control={control}
              render={({ field: { onChange, value } }) => (
                <GenreSelector
                  genres={availableGenres}
                  selectedIds={value}
                  onChange={onChange}
                  max={3}
                  disabled={isPending || availableGenres.length === 0}
                />
              )}
            />
            {errors.genreIds && <p className="text-red-500 text-xs mt-1.5">{errors.genreIds.message}</p>}
          </div>

          {/* Теги (Async Autocomplete) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Теги (до 20)
            </label>
            <TagAutocomplete
              selectedTags={selectedTagObjects}
              onChange={handleTagsChange}
              max={20}
              disabled={isPending}
            />
            {errors.tagIds && <p className="text-red-500 text-xs mt-1.5">{errors.tagIds.message}</p>}
          </div>

          {/* Опис */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Синопсис / Опис</label>
            <textarea
              {...register('description')}
              disabled={isPending}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
        <Link href="/studio" className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Скасувати</Link>
        <button type="submit" disabled={isPending} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
          Створити
        </button>
      </div>
    </form>
  );
};