import { apiClient } from '@/lib/axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<void> => {
    await apiClient.post('/auth/register', credentials);
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  }
};