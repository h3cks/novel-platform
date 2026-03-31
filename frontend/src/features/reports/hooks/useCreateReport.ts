import { useMutation } from '@tanstack/react-query';
import { reportsService } from '../api/reports.service';

export const useCreateReport = () => {
  return useMutation({
    mutationFn: reportsService.createReport,
  });
};