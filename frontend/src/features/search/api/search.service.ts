import { apiClient } from '@/lib/axios';
import { Novel } from '@/features/novels/types';
import { SearchParams } from '../types';

export const searchService = {
  // Пошук новелл за заданими параметрами
  searchNovels: async (params: SearchParams): Promise<Novel[]> => {
    // Відправляємо параметри у вигляді query-строки: /novels?keyword=...
    const { data } = await apiClient.get<Novel[]>('/novels', { params });
    return data;
  }
};