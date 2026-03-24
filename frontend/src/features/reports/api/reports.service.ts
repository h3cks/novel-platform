import { apiClient } from '@/lib/axios';

export interface ReportDTO {
  targetType: 'NOVEL' | 'CHAPTER' | 'COMMENT' | 'USER';
  targetId: number;
  reason: string;
  detail?: string;
}

export const reportsService = {
  // Для обычных пользователей
  createReport: async (data: ReportDTO) => {
    const response = await apiClient.post('/reports', data);
    return response.data;
  },

  // Для модераторов / администраторов
  getReports: async (status?: string) => {
    const { data } = await apiClient.get('/reports', { params: { status } });
    return data.data; // Зависит от формата обертки ответа бэкенда
  },

  updateReportStatus: async (id: number, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED') => {
    const response = await apiClient.patch(`/reports/${id}`, { status });
    return response.data;
  }
};