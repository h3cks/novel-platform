import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../api/reports.service';

export const useReports = (status?: string) => {
  return useQuery({
    queryKey: ['admin-reports', status],
    queryFn: () => reportsService.getReports(status),
  });
};