'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/features/profile/api/profile.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      username: '',
      displayName: '',
    }
  });

  // Завантаження актуальних даних профілю
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    enabled: isAuthenticated,
  });

  // Оновлення форми, коли дані завантажились
  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username || '',
        displayName: profile.displayName || '',
      });
    }
  }, [profile, reset]);

  // Мутація для збереження
  const updateMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Профіль успішно оновлено!');
    }
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) return <div className="text-center py-20">Завантаження профілю...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border mt-10">
      <h1 className="text-3xl font-bold mb-6">Мій Профіль</h1>

      <div className="mb-8 flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
          {profile?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-lg font-semibold">{profile?.email}</p>
          <p className="text-sm text-gray-500">Роль: <span className="font-medium text-blue-600">{profile?.role}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ім'я користувача (Нікнейм)</label>
          <input
            {...register('username')}
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Відображуване ім'я</label>
          <input
            {...register('displayName')}
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
        </button>
      </form>
    </div>
  );
}