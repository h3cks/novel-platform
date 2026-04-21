import { apiClient } from '@/lib/axios';
import { User } from '@/features/auth/types';

export interface AdminStats {
  totalUsers: number;
  newNovels: number;
  openReports: number;
  onlineUsers?: number;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get('/admin/stats');
    return data.data;
  },

  getUsers: async (page = 1, limit = 20): Promise<AdminUsersResponse> => {
    const { data } = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
    return data.data;
  },

  blockUser: async (userId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/block`, { reason });
  },

  changeRole: async (userId: number, role: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/profile/${userId}`);
  },

  blockNovel: async (novelId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/novels/${novelId}/block`, { reason });
  },

  createGenre: async (name: string, description?: string): Promise<void> => {
    await apiClient.post('/admin/genres', { name, description });
  },

  createTag: async (name: string): Promise<void> => {
    await apiClient.post('/admin/tags', { name });
  },

  sendBroadcast: async (title: string, message: string): Promise<void> => {
    await apiClient.post('/admin/broadcast', { title, message });
  }
};