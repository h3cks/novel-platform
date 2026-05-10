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
  const { mutate: updateProfile, isPending: isUpdating, isSuccess } = useUpdateProfile();

  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const logout = useAuthStore((state) => state.logout);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [emailData, setEmailData] = useState({ newEmail: '' });

  const { mutate: resendEmail, isPending: isResending } = useMutation({
    mutationFn: (email: string) => authService.resendConfirmation(email)
  });

  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: () => profileService.deleteProfile(),
    onSuccess: () => {
      logout();
      window.location.href = '/';
    }
  });

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

  const { mutate: changeEmail, isPending: isEmailChanging, error: emailError } = useMutation({
    mutationFn: (data: any) => profileService.changeEmail(data),
    onSuccess: () => {
      setSuccessMessage('Пошту змінено. Перевірте нову скриньку для підтвердження.');
      setIsEmailModalOpen(false);
      setEmailData({ newEmail: '' });
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  });

  const { register, handleSubmit, control, reset, formState: { isDirty } } = useForm<SettingsFormValues>({
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

  if (isProfileLoading) return (
    <div className="max-w-3xl mx-auto p-8 text-center text-slate-500 animate-pulse font-medium">
      Завантаження налаштувань...
    </div>
  );

  const inputStyles = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900";

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">

      {/* Головна картка: Профіль */}
      <form onSubmit={handleSubmit(onSubmitProfile)} className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="flex justify-between items-end mb-8 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Налаштування профілю</h2>
            <p className="text-slate-500 text-sm mt-1">Керуйте тим, як інші користувачі бачать вас на NovelHub</p>
          </div>
          <Link href="/profile" className="hidden sm:flex px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
            Мій профіль
          </Link>
        </div>

        {successMessage && (
          <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/50 font-medium flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {successMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          {/* Аватар зліва */}
          <div className="flex flex-col items-center sm:items-start shrink-0">
            <label className="block text-sm font-bold text-slate-700 mb-3">Фото профілю</label>
            <div className="w-36 h-36">
              <Controller
                name="avatarUrl"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ImageUpload value={value} onChange={onChange} disabled={isUpdating} shape="circle" placeholder="Оновити" />
                )}
              />
            </div>
          </div>

          {/* Інпути справа */}
          <div className="flex-grow space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Відображуване ім'я</label>
              <input
                {...register('displayName')}
                type="text"
                disabled={isUpdating}
                placeholder="Наприклад: Олександр Новел"
                className={inputStyles}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Про себе</label>
              <textarea
                {...register('bio')}
                rows={4}
                disabled={isUpdating}
                placeholder="Розкажіть трохи про свої інтереси чи творчість..."
                className={`${inputStyles} resize-y min-h-[120px]`}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8 mt-8 border-t border-slate-100">
          <button type="submit" disabled={isUpdating || !isDirty} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-sm shadow-indigo-200">
            {isUpdating ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>

      {/* Картка: Безпека */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200/60">
        <h3 className="text-xl font-extrabold text-slate-900 mb-6">Параметри безпеки</h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 rounded-xl border border-slate-200 gap-4 transition-colors hover:bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-500">Електронна пошта</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-bold text-slate-900">{profile?.email}</span>
                {profile?.emailConfirmed ? (
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Підтверджено</span>
                ) : (
                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Не підтверджено</span>
                )}
              </div>
              {!profile?.emailConfirmed && (
                <button type="button" onClick={() => profile?.email && resendEmail(profile.email)} disabled={isResending} className="text-sm text-indigo-600 font-medium hover:text-indigo-700 hover:underline mt-2 disabled:opacity-50 transition-colors">
                  {isResending ? 'Відправлення...' : 'Надіслати лист ще раз'}
                </button>
              )}
            </div>
            <button onClick={() => setIsEmailModalOpen(true)} className="px-5 py-2.5 bg-white border border-slate-300 shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
              Змінити пошту
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 rounded-xl border border-slate-200 gap-4 transition-colors hover:bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-500">Пароль</p>
              <p className="font-bold text-slate-900 mt-1.5 tracking-widest text-lg">••••••••</p>
            </div>
            <button onClick={() => setIsPasswordModalOpen(true)} className="px-5 py-2.5 bg-white border border-slate-300 shadow-sm rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
              Змінити пароль
            </button>
          </div>
        </div>
      </div>

      {/* Картка: Небезпечна зона */}
      <div className="bg-rose-50/50 p-6 sm:p-10 rounded-2xl border border-rose-200 mt-8">
        <h3 className="text-xl font-extrabold text-rose-900 mb-2">Небезпечна зона</h3>
        <p className="text-sm text-rose-700 mb-6 font-medium">Видалення акаунта є незворотною дією. Усі ваші новели, коментарі та історія читання будуть знищені назавжди.</p>
        <button
          type="button"
          onClick={() => { if (window.confirm('Ви впевнені? Це незворотно і всі ваші новели/коментарі будуть видалені.')) deleteAccount(); }}
          disabled={isDeleting}
          className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm shadow-rose-200"
        >
          {isDeleting ? 'Видалення...' : 'Видалити акаунт назавжди'}
        </button>
      </div>

      {/* МОДАЛЬНІ ВІКНА */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Зміна пошти</h3>
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Нова пошта</label>
                <input
                  type="email"
                  required
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ newEmail: e.target.value })}
                  className={inputStyles}
                  placeholder="new@example.com"
                />
              </div>
              {(emailError as any) && <p className="text-rose-500 text-sm font-medium">{(emailError as any).response?.data?.message || 'Помилка зміни пошти'}</p>}
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Скасувати</button>
                <button type="submit" disabled={isEmailChanging || !emailData.newEmail} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold transition-colors shadow-sm">
                  {isEmailChanging ? 'Збереження...' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-6">Зміна пароля</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Поточний пароль</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Новий пароль</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Підтвердження пароля</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={inputStyles}
                />
              </div>
              {localError && <p className="text-rose-500 text-sm font-medium">{localError}</p>}
              {(passwordError as any) && <p className="text-rose-500 text-sm font-medium">{(passwordError as any).response?.data?.message || 'Помилка зміни пароля'}</p>}
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Скасувати</button>
                <button type="submit" disabled={isPasswordChanging || !passwordData.oldPassword || !passwordData.newPassword} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold transition-colors shadow-sm">
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