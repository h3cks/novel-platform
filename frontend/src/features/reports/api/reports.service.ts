import { apiClient } from '@/lib/axios';
import { UpdateReportDTO } from '../types';

export const reportsService = {
  createReport: async (payload: any) => {
    const { data } = await apiClient.post('/reports', payload);
    return data;
  },

  getReports: async (status?: string) => {

    const { data } = await apiClient.get('/reports', {
      params: status && status !== 'ALL' ? { status } : {}
    });
    return data;
  },

  updateReport: async (id: number, payload: UpdateReportDTO) => {
    const { data } = await apiClient.patch(`/reports/${id}`, payload);
    return data;
  }
};