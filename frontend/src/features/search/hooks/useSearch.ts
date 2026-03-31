import { useQuery } from '@tanstack/react-query';
import { searchService } from '../api/search.service';
import { SearchParams } from '../types';

export const useSearch = (params: SearchParams) => {
  return useQuery({
    // Ключ кешу залежить від усіх параметрів пошуку
    queryKey: ['search', params],
    queryFn: () => searchService.searchNovels(params),
    // Не робимо запит, якщо немає текстового запиту або інших фільтрів (опціонально)
    enabled: true,
  });
};