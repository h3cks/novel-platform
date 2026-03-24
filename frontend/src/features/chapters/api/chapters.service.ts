import { apiClient } from '@/lib/axios';

export const chaptersService = {
  createChapter: async (novelId: number, data: { title: string; content: string; order: number }) => {
    const response = await apiClient.post(`/chapters`, { ...data, novelId });
    return response.data;
  }
};