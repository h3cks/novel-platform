import { apiClient } from '@/lib/axios';
import { User } from '@/features/auth/types';

export interface AdminUsersResponse {
  users: User[];
  total: number;
}

export const adminUsersService = {
  getUsers: async (page = 1, limit = 20): Promise<AdminUsersResponse> => {
    const { data } = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
    return data.data; // Залежить від вашого бекенду, підлаштуйте за потреби
  },

  blockUser: async (userId: number, reason: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/block`, { reason });
  },

  unblockUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/unblock`);
  },

  changeRole: async (userId: number, role: 'READER' | 'AUTHOR' | 'MODERATOR' | 'ADMIN'): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
  }
};