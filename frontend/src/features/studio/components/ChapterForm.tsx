'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chapterSchema, ChapterFormValues } from '../schemas/chapter.schema';
import { useCreateChapter } from '../hooks/useCreateChapter';
import { useUpdateChapter } from '../hooks/useUpdateChapter';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import Link from 'next/link';

interface ChapterFormProps {
  novelId: string;
  chapterId?: string;
  initialData?: Partial<ChapterFormValues>;
}

export const ChapterForm = ({ novelId, chapterId, initialData }: ChapterFormProps) => {
  const isEditing = !!initialData && !!chapterId;

  const { mutate: createChapter, isPending: isCreating, error: createError } = useCreateChapter(novelId);
  const { mutate: updateChapter, isPending: isUpdating, error: updateError } = useUpdateChapter(novelId, chapterId || '');

  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterSchema),
    defaultValues: { title: '', content: '' },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        content: initialData.content || '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: ChapterFormValues) => {
    if (isEditing) {
      updateChapter(data);
    } else {
      createChapter(data);
    }
  };

  const apiError = error as any;

  // Витягуємо точну помилку з бекенду
  const errorMessage =
    apiError?.response?.data?.message ||
    apiError?.response?.data?.error?.message ||
    apiError?.message ||
    'Помилка при збереженні розділу.';

  if (apiError) console.error("Деталі помилки API:", apiError?.response?.data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Редагування розділу' : 'Написання розділу'}
        </h2>
        <div className="flex gap-4">
          <Link href={`/studio/novels/${novelId}`} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Скасувати
          </Link>
          <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
            {isPending ? 'Збереження...' : (isEditing ? 'Зберегти зміни' : 'Опублікувати розділ')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
          {apiError?.response?.data?.message || 'Помилка при збереженні розділу.'}
        </div>
      )}

      {/* ... Інпути title та content залишаються БЕЗ ЗМІН як у твоєму коді ... */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Назва розділу</label>
          <input {...register('title')} disabled={isPending} type="text" className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" placeholder="Введіть назву..." />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст</label>
          <Controller name="content" control={control} render={({ field }) => (
            <RichTextEditor content={field.value} onChange={field.onChange} disabled={isPending} />
          )} />
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};