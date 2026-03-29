import { apiClient } from '@/lib/axios';
import { Novel, CreateNovelDTO, UpdateNovelDTO } from '../types';

export const novelsService = {
  // Получить список всех доступных новелл
  getNovels: async (): Promise<Novel[]> => {
    const { data } = await apiClient.get<Novel[]>('/novels');
    return data;
  },

  // Получить детальную информацию о новелле
  getNovelById: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.get<Novel>(`/novels/${id}`);
    return data;
  },

  // Создать новую новеллу (требуется авторизация)
  createNovel: async (payload: CreateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.post<Novel>('/novels', payload);
    return data;
  },

  // Обновить новеллу
  updateNovel: async (id: number | string, payload: UpdateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.patch<Novel>(`/novels/${id}`, payload);
    return data;
  },

  // Опубликовать новеллу
  publishNovel: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.post<Novel>(`/novels/${id}/publish`);
    return data;
  },

  // Удалить новеллу
  deleteNovel: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/novels/${id}`);
  }
};