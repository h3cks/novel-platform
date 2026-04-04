'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema, SettingsFormValues } from '../schemas/settings.schema';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/auth.service';

export const SettingsForm = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating, isSuccess, error } = useUpdateProfile();
  const [successMessage, setSuccessMessage] = useState(false);

  // Мутація для повторного надсилання листа
  const {
    mutate: resendEmail,
    isPending: isResending,
    isSuccess: isResendSuccess,
    error: resendError
  } = useMutation({
    mutationFn: (email: string) => authService.resendConfirmation(email)
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage(true);
      const timer = setTimeout(() => setSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const onSubmit = (data: SettingsFormValues) => {
    updateProfile(data);
  };

  const handleResendEmail = () => {
    if (profile?.email) {
      resendEmail(profile.email);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="animate-pulse space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  const apiError = error as any;
  const resendApiError = resendError as any;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Налаштування профілю</h2>
        <Link href="/profile" className="text-sm font-medium text-blue-600 hover:underline">
          Мій профіль &rarr;
        </Link>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Зміни успішно збережено!
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
          {apiError?.response?.data?.message || 'Сталася помилка при збереженні. Спробуйте пізніше.'}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Аватар профілю
          </label>
          <div className="w-32 h-32">
            <Controller
              name="avatarUrl"
              control={control}
              render={({ field: { onChange, value } }) => (
                <ImageUpload
                  value={value}
                  onChange={onChange}
                  disabled={isUpdating}
                  shape="circle"
                  placeholder="Оновити фото"
                />
              )}
            />
          </div>
          {errors.avatarUrl && <p className="text-red-500 text-sm mt-1">{errors.avatarUrl.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Відображуване ім'я
          </label>
          <input
            {...register('displayName')}
            type="text"
            disabled={isUpdating}
            className={`w-full px-4 py-2 border rounded-md outline-none transition disabled:bg-gray-50 focus:ring-2 ${
              errors.displayName
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Введіть ваше ім'я..."
          />
          {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Про себе
          </label>
          <textarea
            {...register('bio')}
            rows={5}
            disabled={isUpdating}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-gray-50 resize-y"
            placeholder="Розкажіть трохи про себе..."
          />
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
        </div>

        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Поле Email з перевіркою підтвердження */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-500">Email (не можна змінити)</label>
              {profile?.emailConfirmed ? (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Підтверджено
                </span>
              ) : (
                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Не підтверджено
                </span>
              )}
            </div>
            <input type="text" disabled value={profile?.email || ''} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600 text-sm cursor-not-allowed" />

            {/* Кнопка повторного надсилання листа */}
            {profile && !profile.emailConfirmed && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending || isResendSuccess}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
                >
                  {isResending ? 'Надсилання...' : isResendSuccess ? 'Лист успішно надіслано!' : 'Надіслати лист ще раз'}
                </button>
                {resendError && (
                  <p className="text-xs text-red-500 mt-1">
                    {resendApiError?.response?.data?.message || 'Помилка при надсиланні листа'}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Username (не можна змінити)</label>
            <input type="text" disabled value={profile?.username || ''} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600 text-sm cursor-not-allowed" />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isUpdating || !isDirty}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </div>
    </form>
  );
};