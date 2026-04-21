'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'novels' | 'comments' | 'reports'>('novels');

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => adminService.getUserDetail(Number(id)),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Завантаження профілю...</div>;
  if (error || !user) return <div className="p-8 text-center text-red-500">Помилка завантаження даних користувача</div>;

  return (
    <div className="space-y-6">
      {/* Header з основною інфою */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            {user.isBlocked ? (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Заблокований</span>
            ) : (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Активний</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{user.email} • ID: #{user.id} • Роль: {user.role}</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>На сайті з: {new Date(user.createdAt).toLocaleDateString()}</p>
          <p>Востаннє бачили: {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Ніколи'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'novels', label: `Новели (${user.novels?.length || 0})` },
          { id: 'comments', label: `Коментарі (${user.comments?.length || 0})` },
          { id: 'reports', label: `Скарги на нього (${user.reportsAgainst?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Вкладка Новели */}
        {activeTab === 'novels' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">Назва</th>
                <th className="px-6 py-3">Розділи</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3">Дата створення</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {user.novels?.map((n: any) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-indigo-600">
                    <Link href={`/admin/content?novelId=${n.id}`}>{n.title}</Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{n._count.chapters}</td>
                  <td className="px-6 py-4">
                    {n.flagged ? <span className="text-red-500">🚩 Blocked</span> : <span className="text-green-500">✓ OK</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Вкладка Коментарі */}
        {activeTab === 'comments' && (
          <div className="divide-y divide-slate-100">
            {user.comments?.map((c: any) => (
              <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>До новели: <span className="font-bold text-slate-600">{c.novel?.title}</span></span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-700 italic">"{c.text}"</p>
              </div>
            ))}
            {user.comments?.length === 0 && <p className="p-8 text-center text-slate-400">Користувач ще не залишав коментарів</p>}
          </div>
        )}

        {/* Вкладка Скарги (Moderation History) */}
        {activeTab === 'reports' && (
          <div className="divide-y divide-slate-100">
            {user.reportsAgainst?.map((r: any) => (
              <div key={r.id} className="p-4 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">Причина: {r.reason}</p>
                  <p className="text-xs text-slate-500">{r.detail || 'Без деталей'}</p>
                  <div className="text-[10px] text-slate-400">
                    Від: <span className="text-indigo-500">@{r.reporter.username}</span> • {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  r.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
            {user.reportsAgainst?.length === 0 && <p className="p-8 text-center text-green-500">На цього користувача ще не було скарг</p>}
          </div>
        )}

      </div>
    </div>
  );
}