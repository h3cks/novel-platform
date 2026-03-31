import { apiClient } from '@/lib/axios';
import { Report, UpdateReportDTO } from '../types';

export const reportsService = {
  // [+] Новий метод для подачі скарги звичайним користувачем
  createReport: async (payload: { targetType: string; targetId: number; reason: string; detail?: string }): Promise<void> => {
    await apiClient.post('/reports', payload);
  },

  getReports: async (status?: string): Promise<Report[]> => {
    const { data } = await apiClient.get<Report[]>('/admin/reports', { params: { status } });
    return data;
  },

  updateReport: async (id: number, payload: UpdateReportDTO): Promise<Report> => {
    const { data } = await apiClient.patch<Report>(`/admin/reports/${id}`, payload);
    return data;
  },
};