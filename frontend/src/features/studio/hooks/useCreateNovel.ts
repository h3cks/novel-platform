import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
// Використовуємо абсолютний імпорт (аліас @) для надійності
import { novelsService } from '@/features/novels/api/novels.service';
import { NovelFormValues } from '../schemas/novel.schema';

export const useCreateNovel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NovelFormValues) => novelsService.createNovel(data),
    onSuccess: (newNovel) => {
      // Тепер TypeScript бачить сервіс і знає, що newNovel має тип Novel
      queryClient.invalidateQueries({ queryKey: ['novels'] });

      router.push(`/studio/novels/${newNovel.id}`);
    },
    onError: (error: any) => {
      console.error('Failed to create novel:', error.response?.data?.message || error.message);
    },
  });
};