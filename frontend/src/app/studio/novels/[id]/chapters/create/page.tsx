'use client';

import { useForm, Controller } from 'react-hook-form';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useMutation } from '@tanstack/react-query';
import { chaptersService } from '@/features/chapters/api/chapters.service';
import { useRouter, useParams } from 'next/navigation';

interface ChapterForm {
  title: string;
  order: number;
  content: string;
}

export default function CreateChapterPage() {
  const router = useRouter();
  const params = useParams();
  const novelId = Number(params.id);

  const { register, handleSubmit, control } = useForm<ChapterForm>({
    defaultValues: { order: 1 }
  });

  const createChapterMutation = useMutation({
    mutationFn: (data: ChapterForm) => chaptersService.createChapter(novelId, data),
    onSuccess: () => {
      alert('Розділ успішно опубліковано!');
      router.push(`/studio/novels/${novelId}/chapters`);
    }
  });

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Додати новий розділ</h1>

      <form onSubmit={handleSubmit((data) => createChapterMutation.mutate(data))} className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Назва розділу *</label>
            <input
              {...register('title', { required: true })}
              className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Розділ 1: Початок..."
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium mb-1">Номер</label>
            <input
              type="number"
              {...register('order', { valueAsNumber: true })}
              className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Текст розділу *</label>
          <Controller
            name="content"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <RichTextEditor
                content={field.value || ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={createChapterMutation.isPending}
            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            Опублікувати розділ
          </button>
        </div>
      </form>
    </div>
  );
}