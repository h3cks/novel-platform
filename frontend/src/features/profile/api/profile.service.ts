import { apiClient } from '@/lib/axios';
import { UserProfile } from '../types';
import { SettingsFormValues } from '../schemas/settings.schema';

export const profileService = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get('/auth/me');
    // Обов'язково розпаковуємо дані, бо бекенд повертає { data: { user: {...} } }
    return data.data.user;
  },

  getProfileById: async (id: string | number): Promise<UserProfile> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data;
  },

  updateProfile: async (payload: SettingsFormValues): Promise<UserProfile> => {
    const { data } = await apiClient.patch('/users/me', payload);
    return data.data.user || data.data;
  },
};