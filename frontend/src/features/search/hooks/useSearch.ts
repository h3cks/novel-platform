import { useQuery } from '@tanstack/react-query';
import { searchService } from '../api/search.service';

export const useSearch = (params: { q?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchService.searchNovels(params),

    enabled: !!params.q?.trim(),
    staleTime: 60 * 1000,
  });
};