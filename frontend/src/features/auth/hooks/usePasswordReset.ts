import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';

export const usePasswordReset = () => {
  const requestResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post('/auth/request-password-reset', { email });
      return data;
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const { data } = await apiClient.post('/auth/reset-password', { token, newPassword });
      return data;
    },
  });

  return { requestResetMutation, resetPasswordMutation };
};