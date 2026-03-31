import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { studioChaptersService, CreateChapterDTO } from '../api/studio-chapters.service';

export const useCreateChapter = (novelId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChapterDTO) => studioChaptersService.createChapter(novelId, data),
    onSuccess: () => {
      // Інвалідуємо кеш списку розділів цієї новели
      queryClient.invalidateQueries({ queryKey: ['novel-chapters', novelId] });
      // Повертаємо автора на сторінку управління новелою
      router.push(`/studio/novels/${novelId}`);
    },
    onError: (error: any) => {
      console.error('Failed to create chapter:', error.response?.data?.message || error.message);
    },
  });
};