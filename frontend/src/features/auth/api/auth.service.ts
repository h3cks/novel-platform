import { apiClient } from '@/lib/axios';
import { LoginDTO, AuthResponse } from '../types';

export const authService = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};