import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/auth.service';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';

export const useLogin = () => {
  // Використовуємо setAuth замість login
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Передаємо аргументи у правильному порядку: user, потім token
      setAuth(data.user, data.token);
      router.push('/novels'); // Редирект після успішного входу
    },
    onError: (error: any) => {
      console.error('Login failed:', error.response?.data?.message || error.message);
    },
  });
};