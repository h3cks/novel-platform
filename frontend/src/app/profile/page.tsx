'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { profileService } from '@/features/profile/api/profile.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Заполняем форму текущими данными при загрузке
  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      setDisplayName(user.displayName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user, token, router]);

  const updateMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedUser) => {
      // Обновляем глобальный стейт новыми данными пользователя
      if (token) {
        setAuth(updatedUser, token);
      }
      setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
    },
    onError: (error: any) => {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Ошибка обновления профиля' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    updateMutation.mutate({ displayName, avatarUrl });
  };

  if (!user) return null; // Предотвращаем рендер до редиректа, если нет пользователя

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold leading-6 text-slate-900 mb-8">
            Настройки профиля
          </h1>

          {message.text && (
            <div className={`mb-6 rounded-md p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6 mb-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-slate-100">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-full w-full text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700 mb-1">
                  URL Аватара
                </label>
                <input
                  id="avatarUrl"
                  type="text"
                  className="block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Имя пользователя (Логин)
              </label>
              <input
                id="username"
                type="text"
                disabled
                className="block w-full rounded-lg border-0 py-2.5 text-slate-500 bg-slate-50 ring-1 ring-inset ring-slate-300 sm:text-sm px-3 cursor-not-allowed"
                value={user.username}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Электронная почта
              </label>
              <input
                id="email"
                type="email"
                disabled
                className="block w-full rounded-lg border-0 py-2.5 text-slate-500 bg-slate-50 ring-1 ring-inset ring-slate-300 sm:text-sm px-3 cursor-not-allowed"
                value={user.email}
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
                Отображаемое имя
              </label>
              <input
                id="displayName"
                type="text"
                className="block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
                placeholder="Как к вам обращаться?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}