import { apiClient } from '@/lib/axios';

export interface Genre {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export const metaService = {
  getGenres: async () => {
    const { data } = await apiClient.get<{ data: Genre[] }>('/meta/genres');
    return data.data;
  },
  getTags: async () => {
    const { data } = await apiClient.get<{ data: Tag[] }>('/meta/tags');
    return data.data;
  }
};