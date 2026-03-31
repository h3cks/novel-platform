import { apiClient } from '@/lib/axios';
import { Novel, CreateNovelDTO, UpdateNovelDTO } from '../types';

export const novelsService = {
  getNovels: async (params?: Record<string, any>): Promise<Novel[]> => {
    const { data } = await apiClient.get('/novels', { params });
    // Розгортаємо data.data, бо бекенд повертає { success: true, data: [...] }
    return data.data;
  },

  getNovelById: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.get(`/novels/${id}`);
    // Бекенд повертає { success: true, data: { novel: {...} } }
    return data.data.novel;
  },

  createNovel: async (payload: CreateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.post('/novels', payload);
    return data.data.novel;
  },

  updateNovel: async (id: number | string, payload: UpdateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.patch(`/novels/${id}`, payload);
    return data.data.novel;
  },

  publishNovel: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.post(`/novels/${id}/publish`);
    return data.data as any;
  },

  deleteNovel: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/novels/${id}`);
  }
};