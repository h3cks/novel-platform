import { apiClient } from '@/lib/axios';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);


    const { data } = await apiClient.post<{ url: string }>('/upload', formData);

    return data.url;
  }
};