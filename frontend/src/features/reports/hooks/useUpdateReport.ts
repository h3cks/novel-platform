import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '../api/reports.service';
import { UpdateReportDTO } from '../types';

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReportDTO }) =>
      reportsService.updateReport(id, data),
    onSuccess: () => {
      // Оновлюємо таблицю після успішної зміни статусу
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });
};