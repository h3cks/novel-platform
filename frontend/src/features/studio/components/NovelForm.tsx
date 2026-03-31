'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { novelSchema, NovelFormValues } from '../schemas/novel.schema';
import { useCreateNovel } from '../hooks/useCreateNovel';
import Link from 'next/link';

export const NovelForm = () => {
  const { mutate: createNovel, isPending, error } = useCreateNovel();

  const {
    register,
    handleSubmit,
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

      <div className="space-y-6">
        {/* Поле: Назва */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Назва новели <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            {...register('title')}
            disabled={isPending}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-gray-50"
            placeholder="Введіть захоплюючу назву..."
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Поле: Опис */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Синопсис / Опис
          </label>
          <textarea
            id="description"
            {...register('description')}
            disabled={isPending}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-gray-50 resize-y"
            placeholder="Про що ваша історія? Зацікавте читачів..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Кнопки */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
          <Link
            href="/studio"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Скасувати
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? 'Збереження...' : 'Створити новелу'}
          </button>
        </div>
      </div>
    </form>
  );
};