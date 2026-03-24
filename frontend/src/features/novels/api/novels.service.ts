import { apiClient } from '@/lib/axios';
import { Novel, NovelFilters } from '../types';

export const novelsService = {
  getNovels: async (params: NovelFilters) => {
    const { data } = await apiClient.get<{ data: Novel[], total: number }>('/novels', { params });
    return data; // Враховуючи утиліту response.ts на бекенді
  },
  getNovelById: async (id: number) => {
    const { data } = await apiClient.get<{ data: Novel }>(`/novels/${id}`);
    return data.data;
  },
  createNovel: async (payload: Partial<Novel>) => {
    const { data } = await apiClient.post<{ data: Novel }>('/novels', payload);
    return data.data;
  }
};