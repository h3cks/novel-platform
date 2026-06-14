import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { novelsService } from '../api/novels.service';
import { Novel } from '../types';

export const useNovels = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['novels', params],
    queryFn: () => novelsService.getNovels(params),

    enabled: params && 'authorId' in params ? !!params.authorId : true,
  });
};

// НОВИЙ ХУК ДЛЯ СТУДІЇ АВТОРА
export const useStudioNovels = () => {
  return useQuery({
    queryKey: ['studio-novels'],
    queryFn: novelsService.getMyStudioNovels,
  });
};

export const useNovel = (id: string) => {
  return useQuery<Novel>({
    queryKey: ['novel', id],
    queryFn: () => novelsService.getNovelById(id),
    enabled: !!id,
  });
};

export const useRecommendedNovels = () => {
  return useQuery({
    queryKey: ['novels', 'recommended'],
    queryFn: novelsService.getRecommended,
  });
};

export const useTopOfWeekNovels = () => {
  return useQuery({
    queryKey: ['novels', 'top-week'],
    queryFn: novelsService.getTopOfWeek,
  });
};

export const useTopOfDayNovels = () => {
  return useQuery({
    queryKey: ['novels', 'top-day'],
    queryFn: novelsService.getTopOfDay,
  });
};

export const useLatestUpdates = () => {
  return useQuery({
    queryKey: ['novels', 'latest-updates'],
    queryFn: novelsService.getLatestUpdates,
  });
};

export const useCreateNovel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: novelsService.createNovel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['novels'] });
      // Оновлюємо студію при успішному створенні
      queryClient.invalidateQueries({ queryKey: ['studio-novels'] });
    },
  });
};