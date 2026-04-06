import { apiClient } from '@/lib/axios';
import { Chapter } from '@/features/chapters/types';

export interface CreateChapterDTO {
  title: string;
  content: string; // HTML рядок
}

export const studioChaptersService = {
  createChapter: async (novelId: string, payload: CreateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.post<{ chapter: Chapter }>(`/novels/${novelId}/chapters`, payload);
    return data.chapter;
  },

  getNovelChapters: async (novelId: string): Promise<Chapter[]> => {
    const { data } = await apiClient.get(`/novels/${novelId}/chapters`);
    return data.items || data.data?.items || [];
  },

  getChapterById: async (novelId: string, chapterId: string): Promise<Chapter> => {
    const { data } = await apiClient.get<{ chapter: Chapter }>(`/novels/${novelId}/chapters/${chapterId}`);
    return data.chapter;
  },

  updateChapter: async (novelId: string, chapterId: string, payload: Partial<CreateChapterDTO>): Promise<Chapter> => {
    const { data } = await apiClient.patch<{ chapter: Chapter }>(`/novels/${novelId}/chapters/${chapterId}`, payload);
    return data.chapter;
  },
};