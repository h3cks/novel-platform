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
  }
};