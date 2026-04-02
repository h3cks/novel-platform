'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { novelSchema, NovelFormValues } from '../schemas/novel.schema';
import { useCreateNovel } from '../hooks/useCreateNovel';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Link from 'next/link';

export const NovelForm = () => {
  const { mutate: createNovel, isPending, error } = useCreateNovel();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NovelFormValues>({
    resolver: zodResolver(novelSchema),
  });

  const onSubmit = (data: NovelFormValues) => {
    createNovel(data);
  };

  const apiError = error as any;
  const errorMessage = apiError?.response?.data?.message || 'Сталася помилка при збереженні.';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Створення нової новели</h2>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Обкладинка новели
        </label>
        <Controller
          name="coverUrl"
          control={control}
          render={({ field: { onChange, value } }) => (
            <ImageUpload
              value={value}
              onChange={onChange}
              disabled={isPending}
              shape="rectangle"
              placeholder="Завантажити обкладинку"
            />
          )}
        />
        {errors.coverUrl && <p className="text-red-500 text-sm mt-1">{errors.coverUrl.message}</p>}
      </div>

      {/* Поля: Жанри та Теги (Спрощена версія, краще використовувати react-select) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="genres" className="block text-sm font-medium text-gray-700 mb-1">
            Жанр
          </label>
          <select
            id="genres"
            {...register('genres')}
            disabled={isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">Оберіть жанр...</option>
            <option value="FANTASY">Фентезі</option>
            <option value="SCI_FI">Наукова фантастика</option>
            <option value="ROMANCE">Романтика</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Теги (через кому)
          </label>
          <input
            id="tags"
            {...register('tags')}
            disabled={isPending}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="магія, реінкарнація, система..."
          />
        </div>
      </div>
    </form>
  );
};