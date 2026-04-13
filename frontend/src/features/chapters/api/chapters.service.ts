import { apiClient } from '@/lib/axios';
import { Chapter, CreateChapterDTO, UpdateChapterDTO } from '../types';

export const chaptersService = {
  getNovelChapters: async (novelId: number | string): Promise<Chapter[]> => {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters`, {
      params: { sort: 'order', order: 'asc' }
    });
    // Безпечне розпакування масиву
    return data.data?.items || data.items || data.data || data || [];
  },

  getChapterById: async (id: number | string): Promise<Chapter> => {
    // Fallback метод, якщо десь використовується старий підхід
    const { data } = await apiClient.get(`/chapters/${id}`);
    return data.data?.chapter || data.chapter || data;
  },

  getChapter: async (novelId: string | number, chapterId: string | number): Promise<Chapter> => {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters/${chapterId}`);
    return data.data?.chapter || data.chapter || data;
  },

  createChapter: async (novelId: string | number, payload: CreateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.post(`/novels/${novelId}/chapters`, payload);
    return data.data?.chapter || data.chapter || data;
  },

  updateChapter: async (novelId: string | number, id: number | string, payload: UpdateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.patch(`/novels/${novelId}/chapters/${id}`, payload);
    return data.data?.chapter || data.chapter || data;
  },

  deleteChapter: async (novelId: string | number, id: number | string): Promise<void> => {
    await apiClient.delete(`/novels/${novelId}/chapters/${id}`);
  }
};