import { useQuery } from '@tanstack/react-query';
import { profileService } from '../api/profile.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const useProfile = (userId?: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return useQuery({
    queryKey: ['profile', userId || 'me'],
    queryFn: () => (userId ? profileService.getProfileById(userId) : profileService.getMe()),
    // Запит виконується, якщо ми шукаємо чужий профіль АБО ми авторизовані для свого
    enabled: !!userId || isAuthenticated,
  });
};