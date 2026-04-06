import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { studioChaptersService, CreateChapterDTO } from '../api/studio-chapters.service';

export const useUpdateChapter = (novelId: string, chapterId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    // Передаємо novelId у сервіс:
    mutationFn: (data: Partial<CreateChapterDTO>) => studioChaptersService.updateChapter(novelId, chapterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novel-chapters', novelId] });
      queryClient.invalidateQueries({ queryKey: ['chapter', chapterId] });
      router.push(`/studio/novels/${novelId}`);
    },
  });
};