import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { novelsService } from '../api/novels.service';
import { Novel } from '../types';

export const useNovels = () => {
  return useQuery({
    queryKey: ['novels'],
    queryFn: novelsService.getNovels,
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