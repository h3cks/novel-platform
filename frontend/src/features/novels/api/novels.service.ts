import { apiClient } from '@/lib/axios';
import { Novel, CreateNovelDTO, UpdateNovelDTO, LatestUpdate, NovelStatus } from '../types';

export const novelsService = {
  getNovels: async (params?: any) => {

    const queryParams = { ...params };

    if (Array.isArray(queryParams.genres)) {
      queryParams.genres = queryParams.genres.join(',');
    }
    if (Array.isArray(queryParams.tags)) {
      queryParams.tags = queryParams.tags.join(',');
    }
    if (Array.isArray(queryParams.excludeGenres)) {
      queryParams.excludeGenres = queryParams.excludeGenres.join(',');
    }
    if (Array.isArray(queryParams.excludeTags)) {
      queryParams.excludeTags = queryParams.excludeTags.join(',');
    }

    const { data } = await apiClient.get('/novels', { params: queryParams });
    return data.data?.items || data.items || data.data || data || [];
  },

  // НОВИЙ МЕТОД ДЛЯ СТУДІЇ АВТОРА
  getMyStudioNovels: async (): Promise<Novel[]> => {
    const { data } = await apiClient.get('/novels/studio/my');
    return data.data?.items || data.items || [];
  },

  getRecommended: async (): Promise<Novel[]> => {
    // ДОДАНО: &status=PUBLISHED
    const { data } = await apiClient.get('/novels?sort=recommended&limit=15&status=PUBLISHED');

    const items = data.data?.items || data.items || data.data || data || [];
    return Array.isArray(items) ? items : [];
  },

  getTopOfWeek: async (): Promise<Novel[]> => {
    // ДОДАНО: &status=PUBLISHED
    const { data } = await apiClient.get('/novels?sort=views_week&limit=15&status=PUBLISHED');
    return data.data?.items || data.items || [];
  },

  getTopOfDay: async (): Promise<Novel[]> => {
    // ДОДАНО: &status=PUBLISHED
    const { data } = await apiClient.get('/novels?sort=views_day&limit=15&status=PUBLISHED');
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

  rateNovel: async (novelId: string | number, score: number): Promise<void> => {
    await apiClient.post(`/novels/${novelId}/rate`, { score });
  },

  publishNovel: async (id: number | string): Promise<Novel> => {
    const { data } = await apiClient.post(`/novels/${id}/publish`);
    return data.data as any;
  },

  deleteNovel: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/novels/${id}`);
  }
};