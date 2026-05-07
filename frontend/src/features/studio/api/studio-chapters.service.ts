import { apiClient } from '@/lib/axios';
import { Chapter } from '@/features/chapters/types';

export interface CreateChapterDTO {
  title: string;
  content: string;
}

export const studioChaptersService = {
  createChapter: async (novelId: string, payload: CreateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.post(`/novels/${novelId}/chapters`, payload);
    return data.data?.chapter || data.chapter;
  },

  getNovelChapters: async (novelId: string): Promise<Chapter[]> => {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters`);
    return data.data?.items || data.items || data.data || data || [];
  },

  getChapterById: async (novelId: string, chapterId: string): Promise<Chapter> => {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters/${chapterId}`);
    // Виправлено: правильно дістаємо chapter з вкладеного об'єкта data
    const chapter = data.data?.chapter || data.chapter;
    if (!chapter) throw new Error('Дані розділу не знайдено');
    return chapter;
  },

  updateChapter: async (novelId: string, chapterId: string, payload: Partial<CreateChapterDTO>): Promise<Chapter> => {
    const { data } = await apiClient.patch(`/novels/${novelId}/chapters/${chapterId}`, payload);
    return data.data?.chapter || data.chapter;
  },

  deleteChapter: async (novelId: string, chapterId: string): Promise<void> => {
    await apiClient.delete(`/novels/${novelId}/chapters/${chapterId}`);
  },
};