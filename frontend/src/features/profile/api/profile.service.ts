import { apiClient } from '@/lib/axios';
import { User } from '@/features/auth/types';

export const profileService = {
  getProfile: async () => {
    const { data } = await apiClient.get<{ data: User }>('/profile');
    return data.data;
  },
  updateProfile: async (payload: Partial<User>) => {
    const { data } = await apiClient.patch<{ data: User }>('/profile', payload);
    return data.data;
  }
};