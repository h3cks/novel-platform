import { apiClient } from '@/lib/axios';
import { Report, UpdateReportDTO } from '../types';

export const reportsService = {
  // Отримати всі скарги (з опціональним фільтром по статусу)
  getReports: async (status?: string): Promise<Report[]> => {
    const { data } = await apiClient.get<Report[]>('/admin/reports', {
      params: { status }
    });
    return data;
  },

  // Оновити статус скарги
  updateReport: async (id: number, payload: UpdateReportDTO): Promise<Report> => {
    const { data } = await apiClient.patch<Report>(`/admin/reports/${id}`, payload);
    return data;
  },
};