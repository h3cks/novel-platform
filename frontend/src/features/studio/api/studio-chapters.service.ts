import { apiClient } from '@/lib/axios';
import { Chapter } from '@/features/chapters/types';

export interface CreateChapterDTO {
  title: string;
  content: string; // HTML рядок
}

export const studioChaptersService = {
  createChapter: async (novelId: string, payload: CreateChapterDTO): Promise<Chapter> => {
    // Відправляємо POST запит на створення розділу для конкретної новели
    const { data } = await apiClient.post<Chapter>(`/novels/${novelId}/chapters`, payload);
    return data;
  },
};