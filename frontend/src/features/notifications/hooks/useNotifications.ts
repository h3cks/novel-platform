import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../api/notifications.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const useNotifications = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getNotifications,
    enabled: isAuthenticated,
    // Оновлюємо дані кожні 2 хвилини (опціонально)
    refetchInterval: 120000,
  });
};