'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// Перевірте правильність шляху до вашого NovelCard
import { NovelCard } from '@/features/novels/components/NovelCard';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      let response;
      try {
        response = await apiClient.get(`/users/${userId}`);
      } catch (e) {
        response = await apiClient.get(`/profile/${userId}`);
      }

      const data = response.data;

      return data?.data?.user || data?.user || data?.data || data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 animate-pulse">
        <div className="flex gap-8 mb-10">
          <div className="w-32 h-32 bg-slate-200 rounded-full shrink-0"></div>
          <div className="space-y-4 flex-grow py-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-20 bg-slate-100 rounded-xl w-full mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Користувача не знайдено</h1>
        <p className="text-slate-500 mb-8">Можливо, цей акаунт було видалено.</p>
        <Link href="/novels" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
          Повернутися до каталогу
        </Link>
      </div>
    );
  }

  // Безпечне розпакування новел (якщо бекенд повертає їх разом з юзером)
  const novelsArray = Array.isArray(profile.novels) ? profile.novels : [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">

      {/* Шапка профілю */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 mb-12 flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-300 uppercase">
              {profile.username?.charAt(0) || '?'}
            </div>
          )}
        </div>

        <div className="text-center sm:text-left flex-grow w-full">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">
            {profile.displayName || profile.username}
          </h1>
          <p className="text-indigo-600 font-bold mb-6 text-lg">@{profile.username}</p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-700">
            {profile.bio ? (
              <p className="whitespace-pre-line leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="italic text-slate-400 font-medium">Цей автор ще не додав інформацію про себе.</p>
            )}
          </div>
        </div>
      </div>

      {/* Список творів */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center justify-center sm:justify-start gap-3">
          Твори автора
          <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-sm">
            {novelsArray.length}
          </span>
        </h2>

        {novelsArray.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {novelsArray.map((novel: any) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-slate-500 font-medium text-lg">У цього користувача ще немає опублікованих творів.</p>
          </div>
        )}
      </div>

    </div>
  );
}