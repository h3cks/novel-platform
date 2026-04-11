import { apiClient } from '@/lib/axios';
import { Bookmark, ReadingHistory } from '../types';

export const libraryService = {
  getBookmarks: async (): Promise<Bookmark[]> => {
    const { data } = await apiClient.get('/profile/bookmarks'); // Адаптуйте під ваш бекенд
    return data.data;
  },

  addBookmark: async (novelId: number | string): Promise<void> => {
    await apiClient.post(`/novels/${novelId}/bookmark`);
  },

  removeBookmark: async (novelId: number): Promise<void> => {
    await apiClient.delete(`/novels/${novelId}/bookmark`);
  },

  getHistory: async (): Promise<ReadingHistory[]> => {
    const { data } = await apiClient.get('/profile/history'); // Адаптуйте під ваш бекенд
    return data.data;
  }
};