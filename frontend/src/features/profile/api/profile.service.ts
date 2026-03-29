import { apiClient } from '@/lib/axios';
import { User } from '@/features/auth/types';
import { UpdateProfileDTO } from '../types';

export const profileService = {
  // Получение профиля по имени пользователя (публичный доступ)
  getProfile: async (username: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/profile/${username}`);
    return data;
  },

  // Обновление профиля текущего пользователя
  updateProfile: async (payload: UpdateProfileDTO): Promise<User> => {
    const { data } = await apiClient.patch<User>('/profile', payload);
    return data;
  }
};