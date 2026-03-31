import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../api/auth.service';
import { useAuthStore } from '../store/useAuthStore';
import { RegisterFormValues } from '../schemas/register.schema';

export const useRegister = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      // 1. Видаляємо зайве поле confirmPassword
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;

      // 2. Відправляємо запит на реєстрацію (який нічого не повертає)
      await authService.register(registerData);

      // 3. Одразу після успішної реєстрації робимо запит на логін.
      // Цей метод вже поверне { user, token }
      return authService.login({
        email: registerData.email,
        password: registerData.password,
      });
    },
    onSuccess: (data) => {
      // Тепер data містить відповідь від authService.login
      setAuth(data.user, data.token);
      router.push('/novels'); // Редирект після успішної реєстрації та входу
    },
    onError: (error: any) => {
      console.error('Registration failed:', error.response?.data?.message || error.message);
    },
  });
};