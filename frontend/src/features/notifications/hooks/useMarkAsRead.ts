import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../api/notifications.service';

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  const markSingle = useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    markSingle,
    markAll,
  };
};