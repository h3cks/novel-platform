'use client';

import { UserProfile } from '../types';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const avatarLetter = profile?.username ? profile.username.charAt(0).toUpperCase() : '?';

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' })
    : '...';

  const roleLabels: Record<string, { label: string, bg: string }> = {
    READER: { label: 'Читач', bg: 'bg-slate-100 text-slate-700' },
    AUTHOR: { label: 'Автор', bg: 'bg-primary-100 text-primary-800' },
    MODERATOR: { label: 'Модератор', bg: 'bg-purple-100 text-purple-800' },
    ADMIN: { label: 'Адміністратор', bg: 'bg-rose-100 text-rose-800' },
  };

  const userRole = roleLabels[profile.role] || roleLabels.READER;


    return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 relative overflow-hidden">
      {/* Декоративний фон */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-50 to-indigo-50"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-50">
          <img src={avatarLetter} alt={profile.username} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 text-center md:text-left pt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {profile.displayName || profile.username}
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-lg">@{profile.username}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
            <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full ${userRole.bg}`}>
              {userRole.label}
            </span>
            <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              З {formattedDate}
            </span>
          </div>

          {profile.bio && (
            <p className="text-slate-600 mt-6 max-w-2xl leading-relaxed text-lg">
              {profile.bio}
            </p>
          )}

          {profile.stats && (
            <div className="flex gap-8 justify-center md:justify-start mt-8 pt-6 border-t border-slate-100">
              <div className="text-center md:text-left">
                <span className="block text-2xl font-extrabold text-slate-900">{profile.stats.novels || 0}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Творів</span>
              </div>
              <div className="text-center md:text-left">
                <span className="block text-2xl font-extrabold text-slate-900">{profile.stats.followers || 0}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Читачів</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};