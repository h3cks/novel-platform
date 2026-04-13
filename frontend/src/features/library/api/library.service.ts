import { apiClient } from '@/lib/axios';
import { Bookmark, ReadingHistory } from '../types';

export const libraryService = {
  getBookmarks: async (): Promise<Bookmark[]> => {
    const { data } = await apiClient.get('/profile/bookmarks');
    return data.data || [];
  },

  addBookmark: async (novelId: number | string): Promise<void> => {
    await apiClient.post(`/novels/${novelId}/bookmark`);
  },

  removeBookmark: async (novelId: number): Promise<void> => {
    await apiClient.delete(`/novels/${novelId}/bookmark`);
  },

  getHistory: async (): Promise<ReadingHistory[]> => {
    const { data } = await apiClient.get('/profile/history');
    return data.data || [];
  },

  // ДОДАНО: Метод для збереження перегляду
  recordHistory: async (novelId: number | string, chapterId: number | string): Promise<void> => {
    await apiClient.post('/profile/history', { novelId, chapterId });
  }
};