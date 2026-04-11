import { apiClient } from '@/lib/axios';
import { Notification } from '../types';

export const notificationsService = {
  getNotifications: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get('/notifications');
    // Підлаштовуємо під формат бекенду (шукаємо масив всередині data)
    return data.data?.items || data.data || data || [];
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};