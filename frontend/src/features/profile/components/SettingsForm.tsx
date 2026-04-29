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
import { profileService } from '../api/profile.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const SettingsForm = () => {
  const { data: profile, isLoading: isProfileLoading, refetch } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating, isSuccess, error } = useUpdateProfile();

  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const logout = useAuthStore((state) => state.logout);

  // Стани для модальних вікон
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Стани для даних форм безпеки
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [emailData, setEmailData] = useState({ newEmail: '' });

  // Мутація повторного надсилання листа
  const { mutate: resendEmail, isPending: isResending, isSuccess: isResendSuccess, error: resendError } = useMutation({
    mutationFn: (email: string) => authService.resendConfirmation(email)
  });

  // Мутація видалення
  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: () => profileService.deleteProfile(),
    onSuccess: () => {
      logout();
      window.location.href = '/';
    }
  });

  // Мутація зміни пароля
  const { mutate: changePassword, isPending: isPasswordChanging, error: passwordError } = useMutation({
    mutationFn: (data: any) => profileService.changePassword(data),
    onSuccess: () => {
      setSuccessMessage('Пароль успішно змінено!');
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => {
      setPasswordData(prev => ({ ...prev, oldPassword: '' }));
    }
  });

  // Мутація зміни пошти
  const { mutate: changeEmail, isPending: isEmailChanging, error: emailError } = useMutation({
    mutationFn: (data: any) => profileService.changeEmail(data),
    onSuccess: () => {
      setSuccessMessage('Пошту змінено. Будь ласка, перевірте нову скриньку для підтвердження.');
      setIsEmailModalOpen(false);
      setEmailData({ newEmail: '' });
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  });

  const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { displayName: '', bio: '', avatarUrl: '' },
  });

  useEffect(() => {
    if (profile) reset({ displayName: profile.displayName || '', bio: profile.bio || '', avatarUrl: profile.avatarUrl || '' });
  }, [profile, reset]);

  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage('Профіль успішно оновлено!');
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const onSubmitProfile = (data: SettingsFormValues) => {
    updateProfile(data);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setLocalError("Нові паролі не співпадають!");
      return;
    }
    setLocalError('');
    changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailData.newEmail.includes('@')) {
      alert("Введіть коректну адресу електронної пошти");
      return;
    }
    changeEmail({ newEmail: emailData.newEmail });
  };



  if (isProfileLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Завантаження налаштувань...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">

      <form onSubmit={handleSubmit(onSubmitProfile)} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Налаштування профілю</h2>
          <Link href="/profile" className="text-sm font-medium text-blue-600 hover:underline">Мій профіль &rarr;</Link>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200 font-medium">
            {successMessage}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Аватар</label>
            <div className="w-32 h-32">
              <Controller
                name="avatarUrl"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ImageUpload value={value} onChange={onChange} disabled={isUpdating} shape="circle" placeholder="Оновити фото" />
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Відображуване ім'я</label>
            <input
              {...register('displayName')}
              type="text"
              disabled={isUpdating}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Про себе</label>
            <textarea
              {...register('bio')}
              rows={4}
              disabled={isUpdating}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-y outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isUpdating || !isDirty} className="bg-blue-600 text-white px-8 py-2.5 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isUpdating ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </div>
      </form>

      {/* Секція Безпеки */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Безпека</h3>

        <div className="space-y-6">
          {/* Email інфо */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Електронна пошта</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold text-gray-900">{profile?.email}</span>
                {profile?.emailConfirmed ? (
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase">Підтверджено</span>
                ) : (
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase">Не підтверджено</span>
                )}
              </div>
              {!profile?.emailConfirmed && (
                <button type="button" onClick={() => profile?.email && resendEmail(profile.email)} disabled={isResending} className="text-xs text-blue-600 hover:underline mt-2 disabled:opacity-50">
                  {isResending ? 'Відправлення...' : 'Надіслати лист ще раз'}
                </button>
              )}
            </div>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors bg-white whitespace-nowrap"
            >
              Змінити пошту
            </button>
          </div>

          {/* Пароль інфо */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Пароль</p>
              <p className="font-medium text-gray-900 mt-1">********</p>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors bg-white whitespace-nowrap"
            >
              Змінити пароль
            </button>
          </div>
        </div>
      </div>

      {/* Небезпечна зона */}
      <div className="bg-red-50 p-6 md:p-8 rounded-xl shadow-sm border border-red-100 mt-8">
        <h3 className="text-xl font-bold text-red-800 mb-2">Небезпечна зона</h3>
        <p className="text-sm text-red-600 mb-6">Видалення акаунта є незворотною дією. Усі ваші дані будуть видалені назавжди.</p>
        <button
          type="button"
          onClick={() => { if (window.confirm('Ви впевнені? Це незворотно і всі ваші новели/коментарі можуть бути видалені.')) deleteAccount(); }}
          disabled={isDeleting}
          className="bg-red-600 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isDeleting ? 'Видалення...' : 'Видалити акаунт назавжди'}
        </button>
      </div>

      {/* ---------------- МОДАЛЬНІ ВІКНА ---------------- */}

      {/* Модалка Email */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Зміна пошти</h3>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Нова пошта</label>
                <input
                  type="email"
                  required
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ newEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="new@example.com"
                />
              </div>
              {(emailError as any) && <p className="text-red-500 text-sm">{(emailError as any).response?.data?.message || 'Помилка зміни пошти'}</p>}
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors">Скасувати</button>
                <button type="submit" disabled={isEmailChanging || !emailData.newEmail} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors">
                  {isEmailChanging ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка Пароля */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Зміна пароля</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Поточний пароль</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Новий пароль</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Підтвердження нового пароля</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {localError && <p className="text-red-500 text-sm font-medium">{localError}</p>}
              {(passwordError as any) && <p className="text-red-500 text-sm font-medium">{(passwordError as any).response?.data?.message || 'Помилка зміни пароля'}</p>}
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors">Скасувати</button>
                <button type="submit" disabled={isPasswordChanging || !passwordData.oldPassword || !passwordData.newPassword} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors">
                  {isPasswordChanging ? 'Оновлення...' : 'Оновити'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};