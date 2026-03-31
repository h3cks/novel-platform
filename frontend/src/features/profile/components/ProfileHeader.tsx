'use client';

import { UserProfile } from '../types';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const avatarImage = profile.avatarUrl || '/placeholder-avatar.png'; // Заглушка, якщо немає аватара

  const formattedDate = new Date(profile.createdAt).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Маппінг ролей
  const roleLabels: Record<string, string> = {
    READER: 'Читач',
    AUTHOR: 'Автор',
    MODERATOR: 'Модератор',
    ADMIN: 'Адміністратор',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
      {/* Аватар */}
      <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-4xl font-bold text-gray-300">
        {profile.avatarUrl ? (
          <img src={avatarImage} alt={profile.username} className="w-full h-full object-cover" />
        ) : (
          profile.username.charAt(0).toUpperCase()
        )}
      </div>

      {/* Інформація */}
      <div className="flex-1 text-center md:text-left space-y-3">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {profile.displayName || profile.username}
          </h1>
          <p className="text-gray-500 font-medium mt-1">@{profile.username}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
            {roleLabels[profile.role] || profile.role}
          </span>
          <span className="text-sm text-gray-500">
            На платформі з {formattedDate}
          </span>
        </div>

        {profile.bio && (
          <p className="text-gray-700 mt-4 max-w-2xl leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Статистика (якщо бекенд її повертає) */}
        {profile.stats && (
          <div className="flex gap-6 justify-center md:justify-start mt-6 border-t pt-4 border-gray-100">
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">{profile.stats.novels || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Творів</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">{profile.stats.followers || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Підписників</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900">{profile.stats.following || 0}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Підписок</span>
            </div>
          </div>
        )}
      </div>

      {/* Кнопка редагування (Заглушка для майбутнього) */}
      <div className="shrink-0 mt-4 md:mt-0">
        <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition">
          Редагувати профіль
        </button>
      </div>
    </div>
  );
};