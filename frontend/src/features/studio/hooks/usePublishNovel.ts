import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export const usePublishNovel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (novelId: string) => {
      // Використовуємо правильний POST-роут бекенду замість PATCH
      const { data } = await apiClient.post(`/novels/${novelId}/publish`);
      return data;
    },
    onSuccess: (_, novelId) => {
      queryClient.invalidateQueries({ queryKey: ['novels'] });
      queryClient.invalidateQueries({ queryKey: ['novel', novelId] });
      queryClient.invalidateQueries({ queryKey: ['novel-chapters', novelId] });
    },
  });
};