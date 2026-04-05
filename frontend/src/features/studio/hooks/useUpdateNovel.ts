import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { novelsService } from '@/features/novels/api/novels.service';
import { NovelFormValues } from '../schemas/novel.schema';

export const useUpdateNovel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: NovelFormValues }) =>
      novelsService.updateNovel(id, data),
    onSuccess: (updatedNovel) => {
      // Очищаємо кеш, щоб списки новел оновилися
      queryClient.invalidateQueries({ queryKey: ['novels'] });
      queryClient.invalidateQueries({ queryKey: ['novel', String(updatedNovel.id)] });

      // Повертаємо автора назад на панель управління цією новелою
      router.push(`/studio/novels/${updatedNovel.id}`);
    },
    onError: (error: any) => {
      console.error('Failed to update novel:', error.response?.data?.message || error.message);
    },
  });
};