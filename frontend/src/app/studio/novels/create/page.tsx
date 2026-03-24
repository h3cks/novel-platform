'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { novelsService } from '@/features/novels/api/novels.service';
import { metaService } from '@/lib/api/meta.service';
import { useRouter } from 'next/navigation';

export default function CreateNovelPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<{ title: string; description: string; genreIds: number[] }>();

  // Завантажуємо список жанрів з БД
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: metaService.getGenres,
  });

  const createMutation = useMutation({
    mutationFn: novelsService.createNovel,
    onSuccess: (newNovel) => {
      queryClient.invalidateQueries({ queryKey: ['novels'] });
      router.push(`/studio/novels/${newNovel.id}/chapters`);
    }
  });

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Створення нової новели</h1>



      <form onSubmit={handleSubmit((data) => {
        const formattedData = {
          ...data,
          genreIds: data.genreIds ? data.genreIds.map(Number) : []
        };
        createMutation.mutate(formattedData);
      })} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Назва новели *</label>
          <input
            {...register('title', { required: true })}
            className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введіть назву..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Анотація (Опис)</label>
          <textarea
            {...register('description')}
            rows={6}
            className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Про що ваша історія?..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Оберіть жанри</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {genres?.map((genre) => (
              <label key={genre.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded border cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  value={genre.id}
                  {...register('genreIds')}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            Скасувати
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Створення...' : 'Створити'}
          </button>
        </div>
      </form>
    </div>
  );
}