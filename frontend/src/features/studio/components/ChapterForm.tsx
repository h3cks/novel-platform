'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chapterSchema, ChapterFormValues } from '../schemas/chapter.schema';
import { useCreateChapter } from '../hooks/useCreateChapter';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import Link from 'next/link';

interface ChapterFormProps {
  novelId: string;
}

export const ChapterForm = ({ novelId }: ChapterFormProps) => {
  const { mutate: createChapter, isPending, error } = useCreateChapter(novelId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = (data: ChapterFormValues) => {
    createChapter(data);
  };

  const apiError = error as any;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Написання розділу</h2>
        <div className="flex gap-4">
          <Link
            href={`/studio/novels/${novelId}`}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Скасувати
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? 'Збереження...' : 'Опублікувати розділ'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
          {apiError?.response?.data?.message || 'Помилка при збереженні розділу.'}
        </div>
      )}

      <div className="space-y-6">
        {/* Назва розділу */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Назва розділу (наприклад: "Розділ 1: Початок")
          </label>
          <input
            {...register('title')}
            disabled={isPending}
            type="text"
            className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-gray-50"
            placeholder="Введіть назву..."
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Текстовий редактор (TipTap) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Текст
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>
      </div>
    </form>
  );
};