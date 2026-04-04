import { apiClient } from '@/lib/axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data; // Містить { token, user }
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data.data.user;
  },

  register: async (credentials: RegisterCredentials): Promise<void> => {
    await apiClient.post('/auth/register', credentials);
  },

  resendConfirmation: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-confirmation', { email });
  },
};