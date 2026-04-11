import { apiClient } from '@/lib/axios';
import { UserProfile } from '../types';
import { SettingsFormValues } from '../schemas/settings.schema';

export const profileService = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get('/auth/me');
    return data.data?.user || data.data;
  },

  getProfileById: async (id: string | number): Promise<UserProfile> => {
    const { data } = await apiClient.get(`/profile/${id}`);
    return data.data?.user || data.data;
  },

  updateProfile: async (payload: SettingsFormValues): Promise<UserProfile> => {
    const { data } = await apiClient.patch('/profile', payload);
    return data.data?.user || data.data;
  },
};