'use client';

import { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from './ProfileHeader';

export const ProfileLayout = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: profile, isLoading, isError } = useProfile(); // За замовчуванням бере "me"

  // Чекаємо, поки клієнт змонтується і дістане токен з localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Якщо компонент ще монтується АБО дані завантажуються — показуємо лоадер
  if (!isMounted || isLoading) {
    return (
      <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-6">
        <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full mx-auto md:mx-0 shrink-0"></div>
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto md:mx-0"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto md:mx-0"></div>
          <div className="h-4 bg-gray-200 rounded w-full max-w-md mt-6 mx-auto md:mx-0"></div>
        </div>
      </div>
    );
  }

  // Тільки після того, як ми переконалися, що запит закінчився помилкою або даних дійсно немає
  if (isError || !profile) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Профіль не знайдено</h3>
        <p className="text-gray-500">Увійдіть в систему, щоб переглянути свій профіль.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} />

      {/* Вкладки (Tabs) для новел, закладок, коментарів */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Моя активність</h2>
        <div className="text-center py-12 text-gray-500">
          Тут буде відображатися список новел, коментарів або збережених закладок.
        </div>
      </div>
    </div>
  );
};