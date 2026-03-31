import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../api/profile.service';
import { SettingsFormValues } from '../schemas/settings.schema';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SettingsFormValues) => profileService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Оновлюємо кеш профілю, щоб зміни одразу відобразилися на UI
      queryClient.setQueryData(['profile', 'me'], updatedProfile);

      // Також інвалідуємо кеш, щоб примусово підтягнути свіжі дані при наступному запиті
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
};