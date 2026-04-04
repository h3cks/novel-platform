import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { novelsService } from '../api/novels.service';
import { Novel } from '../types';

// ДОДАНО: params?: Record<string, any>
export const useNovels = (params?: Record<string, any>) => {
  return useQuery({
    // ДОДАНО: params у queryKey для коректного кешування
    queryKey: ['novels', params],
    // ДОДАНО: передаємо params у сервіс
    queryFn: () => novelsService.getNovels(params),
  });
};

export const useNovel = (id: string) => {
  return useQuery<Novel>({
    queryKey: ['novel', id],
    queryFn: () => novelsService.getNovelById(id),
    enabled: !!id,
  });
};

export const useCreateNovel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: novelsService.createNovel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novels'] });
    },
  });
};