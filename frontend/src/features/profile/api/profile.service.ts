import { apiClient } from '@/lib/axios';
import { UserProfile } from '../types';
import { SettingsFormValues } from '../schemas/settings.schema';

export const profileService = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/auth/me');
    return data;
  },

  getProfileById: async (id: string | number): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>(`/users/${id}`);
    return data;
  },

  updateProfile: async (payload: SettingsFormValues): Promise<UserProfile> => {
    const { data } = await apiClient.patch<UserProfile>('/users/me', payload);
    return data;
  },
};