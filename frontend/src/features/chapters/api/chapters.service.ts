import { apiClient } from '@/lib/axios';
import { Chapter, CreateChapterDTO, UpdateChapterDTO } from '../types';

export const chaptersService = {
  getNovelChapters: async (novelId: number | string): Promise<Chapter[]> => {
    const { data } = await apiClient.get('/chapters', {
      params: { novelId, sort: 'order', order: 'asc' }
    });
    // Безпечне розпакування масиву
    return data.data?.items || data.items || data.data || data || [];
  },

  getChapterById: async (id: number | string): Promise<Chapter> => {
    const { data } = await apiClient.get(`/chapters/${id}`);
    // Розпакування об'єкта глави
    return data.data?.chapter || data.chapter || data;
  },

  getChapter: async (novelId: string, chapterId: string): Promise<Chapter> => {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters/${chapterId}`);
    // Розпакування об'єкта глави для ReaderView
    return data.data?.chapter || data.chapter || data;
  },

  createChapter: async (payload: CreateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.post('/chapters', payload);
    return data.data?.chapter || data.chapter || data;
  },

  updateChapter: async (id: number | string, payload: UpdateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.patch(`/chapters/${id}`, payload);
    return data.data?.chapter || data.chapter || data;
  },

  deleteChapter: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/chapters/${id}`);
  }
};