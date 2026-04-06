'use client';

import { useQuery } from '@tanstack/react-query';
import { novelsService } from '@/features/novels/api/novels.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Novel } from '@/features/novels/types';
import Link from 'next/link';

export default function StudioDashboard() {
  const { user } = useAuthStore();

  const { data: myNovels, isLoading } = useQuery({
    queryKey: ['novels', 'my', user?.id],
    queryFn: () => novelsService.getNovels({ authorId: user?.id, limit: 50 }),
    enabled: !!user?.id,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Студія Автора</h1>
          <p className="text-slate-500 mt-1">Керуйте своїми новелами та розділами</p>
        </div>
        <Link
          href="/studio/novels/create"
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 inline-flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Створити новелу
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl w-full"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Назва</th>
                <th className="p-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">Статус</th>
                <th className="p-5 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Дії</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
              {myNovels?.map((novel: Novel) => (
                <tr key={novel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 font-bold text-slate-900">{novel.title}</td>
                  <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        novel.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {novel.status === 'PUBLISHED' ? 'Опубліковано' : 'Чернетка'}
                      </span>
                  </td>
                  <td className="p-5 flex justify-end gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link href={`/studio/novels/${novel.id}/edit`} className="text-slate-500 hover:text-primary-600 font-semibold transition-colors">
                      Редагувати
                    </Link>
                    <Link href={`/studio/novels/${novel.id}/chapters`} className="text-slate-500 hover:text-primary-600 font-semibold transition-colors">
                      Розділи
                    </Link>
                  </td>
                </tr>
              ))}
              {myNovels?.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Немає новел</h3>
                    <p className="text-slate-500">Ви ще не створили жодної новели.</p>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}