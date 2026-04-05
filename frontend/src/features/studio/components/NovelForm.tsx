'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { novelSchema, NovelFormValues } from '../schemas/novel.schema';
import { useCreateNovel } from '../hooks/useCreateNovel';
import { useUpdateNovel } from '../hooks/useUpdateNovel'; // ДОДАНО
import Link from 'next/link';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { GenreSelector } from '@/components/ui/GenreSelector';
import { TagAutocomplete } from '@/components/ui/TagAutocomplete';
import { apiClient } from '@/lib/axios';

// ДОДАНО ПРОПСИ ДЛЯ РЕДАГУВАННЯ
interface NovelFormProps {
  initialData?: any;
  novelId?: string;
}

export const NovelForm = ({ initialData, novelId }: NovelFormProps) => {
  const { mutate: createNovel, isPending: isCreating, error: createError } = useCreateNovel();
  const { mutate: updateNovel, isPending: isUpdating, error: updateError } = useUpdateNovel();

  const isPending = isCreating || isUpdating;
  const error = createError || updateError;
  const isEditing = !!initialData && !!novelId;

  const [availableGenres, setAvailableGenres] = useState<{id: number, name: string}[]>([]);
  const [selectedTagObjects, setSelectedTagObjects] = useState<{id: number, name: string}[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
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

  // Завантаження жанрів
  useEffect(() => {
    apiClient.get('/meta/genres').then((res) => {
      setAvailableGenres(res.data.data?.items || res.data.items || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        coverUrl: initialData.coverUrl || '',

        genreIds: initialData.genres?.map((item: any) => item.genre.id) || [],
        tagIds: initialData.tags?.map((item: any) => item.tag.id) || [],
      });


      if (initialData.tags) {
        setSelectedTagObjects(initialData.tags.map((item: any) => item.tag));
      }
    }
  }, [initialData, reset]);

  const handleTagsChange = (tags: {id: number, name: string}[]) => {
    setSelectedTagObjects(tags);
    setValue('tagIds', tags.map(t => t.id), { shouldValidate: true });
  };

  const onSubmit = (data: NovelFormValues) => {
    if (isEditing) {
      updateNovel({ id: novelId, data });
    } else {
      createNovel(data);
    }
  };

  const apiError = error as any;
  // Тепер ми витягуємо точну причину з бекенду або показуємо деталі Axios
  const errorMessage =
    apiError?.response?.data?.message ||
    apiError?.response?.data?.error?.message ||
    apiError?.message ||
    'Сталася помилка при збереженні.';

  // Виводимо в консоль для легкого дебагу, якщо раптом знову зламається
  if (apiError) console.error("Деталі помилки API:", apiError?.response?.data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">
        {isEditing ? 'Редагування новели' : 'Створення нової новели'}
      </h2>

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
              Жанри (від 1 до 5) *
            </label>
            <Controller
              name="genreIds"
              control={control}
              render={({ field: { onChange, value } }) => (
                <GenreSelector
                  genres={availableGenres}
                  selectedIds={value || []} // Гарантуємо, що це завжди масив
                  onChange={(ids) => {
                    onChange(ids); // Передаємо зміни назад у форму
                  }}
                  max={5}
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
        <Link href={isEditing ? `/studio/novels/${novelId}` : "/studio"} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Скасувати</Link>
        <button type="submit" disabled={isPending} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
          {isEditing ? 'Зберегти зміни' : 'Створити'}
        </button>
      </div>
    </form>
  );
};