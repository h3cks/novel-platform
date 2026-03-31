import { apiClient } from '@/lib/axios';
import { Novel, CreateNovelDTO, UpdateNovelDTO } from '../types';

export const novelsService = {
  // Отримати список новел (з можливістю передачі параметрів фільтрації)
  getNovels: async (params?: Record<string, any>): Promise<Novel[]> => {
    // Додаємо { params } у запит
    const { data } = await apiClient.get<Novel[]>('/novels', { params });
    return data;
  },

  // Отримати детальну інформацію про новелу
  getNovelById: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.get<Novel>(`/novels/${id}`);
    return data;
  },

  // Створити нову новелу (потрібна авторизація)
  createNovel: async (payload: CreateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.post<Novel>('/novels', payload);
    return data;
  },

  // Оновити новелу
  updateNovel: async (id: number | string, payload: UpdateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.patch<Novel>(`/novels/${id}`, payload);
    return data;
  },

  // Опублікувати новелу
  publishNovel: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.post<Novel>(`/novels/${id}/publish`);
    return data;
  },

  // Видалити новелу
  deleteNovel: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/novels/${id}`);
  }
};