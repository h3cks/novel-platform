import { apiClient } from '@/lib/axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    // Розгортаємо, бо бекенд повертає { data: { token, user } }
    return data.data;
  },

  register: async (credentials: RegisterCredentials): Promise<void> => {
    await apiClient.post('/auth/register', credentials);
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    // Розгортаємо, бо бекенд повертає { data: { user: {...} } }
    return data.data.user;
  }
};