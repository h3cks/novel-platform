import { apiClient } from '@/lib/axios';
import { Novel, CreateNovelDTO, UpdateNovelDTO } from '../types';

export const novelsService = {
  // Тепер приймає опціональні параметри (наприклад: { authorId: 1, limit: 10 })
  getNovels: async (params?: Record<string, any>): Promise<Novel[]> => {
    const { data } = await apiClient.get<Novel[]>('/novels', { params });
    return data;
  },

  getNovelById: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.get<Novel>(`/novels/${id}`);
    return data;
  },

  createNovel: async (payload: CreateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.post<Novel>('/novels', payload);
    return data;
  },

  updateNovel: async (id: number | string, payload: UpdateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.patch<Novel>(`/novels/${id}`, payload);
    return data;
  },

  publishNovel: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.post<Novel>(`/novels/${id}/publish`);
    return data;
  },

  deleteNovel: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/novels/${id}`);
  }
};