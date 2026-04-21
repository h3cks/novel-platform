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

  getAuditLogs: async (page = 1, limit = 30) => {
    const { data } = await apiClient.get(`/admin/audit-logs?page=${page}&limit=${limit}`);
    return data.data;
  },

  getUsers: async (page = 1, limit = 20, search = '', role = 'ALL'): Promise<AdminUsersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (role && role !== 'ALL') params.append('role', role);

    const { data } = await apiClient.get(`/admin/users?${params.toString()}`);
    return data.data;
  },

  getUserDetail: async (userId: number) => {
    const { data } = await apiClient.get(`/admin/users/${userId}`);
    return data.data;
  },

  blockUser: async (userId: number, isBlocked: boolean, reason: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/block`, { isBlocked, reason });
  },

  changeRole: async (userId: number, role: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role });
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
  },

  getNovels: async (page = 1, limit = 20) => {
    const { data } = await apiClient.get(`/admin/novels?page=${page}&limit=${limit}`);
    return data.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  deleteNovel: async (novelId: number): Promise<void> => {
    await apiClient.delete(`/admin/novels/${novelId}`);
  },

  getGenres: async () => {
    const { data } = await apiClient.get('/admin/genres');
    return data.data;
  },
  deleteGenre: async (id: number) => {
    await apiClient.delete(`/admin/genres/${id}`);
  },
  getTags: async () => {
    const { data } = await apiClient.get('/admin/tags');
    return data.data;
  },
  deleteTag: async (id: number) => {
    await apiClient.delete(`/admin/tags/${id}`);
  },
  getAdminNovelDetail: async (id: number) => {
    const { data } = await apiClient.get(`/admin/novels/${id}/detail`);
    return data.data;
  }

};