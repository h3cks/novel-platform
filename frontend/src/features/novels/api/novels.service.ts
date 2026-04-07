import { apiClient } from '@/lib/axios';
import { Novel, CreateNovelDTO, UpdateNovelDTO, LatestUpdate, NovelStatus } from '../types';

export const novelsService = {
  getNovels: async (params?: any) => {
    const { data } = await apiClient.get('/novels', { params });
    return data;
  },

  // НОВІ МЕТОДИ ДЛЯ ГОЛОВНОЇ СТОРІНКИ:
  getRecommended: async (): Promise<Novel[]> => {
    const { data } = await apiClient.get('/novels?sort=recommended&limit=15');
    return data.data?.items || data.items || [];
  },

  getTopOfWeek: async (): Promise<Novel[]> => {
    const { data } = await apiClient.get('/novels?sort=views_week&limit=15');
    return data.data?.items || data.items || [];
  },

  getTopOfDay: async (): Promise<Novel[]> => {
    const { data } = await apiClient.get('/novels?sort=views_day&limit=15');
    return data.data?.items || data.items || [];
  },

  getLatestUpdates: async (): Promise<LatestUpdate[]> => {

    const { data } = await apiClient.get('/novels/latest-updates?limit=15');
    return data.data || data;
  },

  getNovelById: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.get(`/novels/${id}`);
    return data.data.novel;
  },

  createNovel: async (payload: CreateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.post('/novels', payload);
    return data.data.novel;
  },

  updateNovel: async (id: number | string, payload: UpdateNovelDTO): Promise<Novel> => {
    const { data } = await apiClient.patch(`/novels/${id}`, payload);
    return data.data.novel;
  },

  publishNovel: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.post(`/novels/${id}/publish`);
    return data.data as any;
  },

  deleteNovel: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/novels/${id}`);
  }
};

