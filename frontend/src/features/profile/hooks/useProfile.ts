import { useQuery } from '@tanstack/react-query';
import { profileService } from '../api/profile.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const useProfile = (userId?: string) => {
  // Використовуємо токен напряму для реактивності
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;

  return useQuery({
    queryKey: ['profile', userId || 'me'],
    queryFn: () => (userId ? profileService.getProfileById(userId) : profileService.getMe()),
    // Запит виконується лише якщо є userId АБО користувач авторизований
    enabled: !!userId || isAuthenticated,
    // Додаємо невелику затримку або retry, якщо токен ще не підвантажився
    retry: 1,
  });
};