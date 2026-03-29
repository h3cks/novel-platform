import { apiClient } from '@/lib/axios';
import { Chapter, CreateChapterDTO, UpdateChapterDTO } from '../types';

export const chaptersService = {
  // Отримати всі розділи конкретної новели (наприклад, для змісту)
  getNovelChapters: async (novelId: number | string): Promise<Chapter[]> => {
    // Припускаємо, що бекенд підтримує фільтрацію через query-параметри
    const { data } = await apiClient.get<Chapter[]>('/chapters', {
      params: { novelId, sort: 'order', order: 'asc' }
    });
    return data;
  },

  // Отримати конкретний розділ для читання
  getChapterById: async (id: number | string): Promise<Chapter> => {
    const { data } = await apiClient.get<Chapter>(`/chapters/${id}`);
    return data;
  },

  // Створити новий розділ (для авторів)
  createChapter: async (payload: CreateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.post<Chapter>('/chapters', payload);
    return data;
  },

  // Оновити розділ
  updateChapter: async (id: number | string, payload: UpdateChapterDTO): Promise<Chapter> => {
    const { data } = await apiClient.patch<Chapter>(`/chapters/${id}`, payload);
    return data;
  },

  // Видалити розділ
  deleteChapter: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/chapters/${id}`);
  }
};