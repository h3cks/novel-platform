import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { novelsService } from '../api/novels.service';
import { NovelFilters } from '../types';

export const useNovels = (filters: NovelFilters) => {
  return useQuery({
    queryKey: ['novels', filters],
    queryFn: () => novelsService.getNovels(filters),
  });
};

export const useNovel = (id: number) => {
  return useQuery({
    queryKey: ['novels', id],
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