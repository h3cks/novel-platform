import { apiClient } from '@/lib/axios';
import { Novel } from '@/features/novels/types';

export const searchService = {
  searchNovels: async (params: { q?: string; page?: number; limit?: number }): Promise<Novel[]> => {
    if (!params.q?.trim()) return [];

    const { data } = await apiClient.get('/novels', { params });

    const items = data.data?.items || data.items || data.data || data || [];
    return Array.isArray(items) ? items : [];
  },
};