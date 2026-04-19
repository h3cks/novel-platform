'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import { User } from '@/features/auth/types';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  // Отримання списку
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => adminService.getUsers(page, limit),
  });

  // Мутація блокування
  const blockMutation = useMutation({
    mutationFn: ({ userId, currentStatus }: { userId: number; currentStatus: boolean }) =>
      adminService.blockUser(userId, currentStatus ? 'unblock' : 'rule violation'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  // Мутація зміни ролі
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      adminService.changeRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Завантаження списку користувачів...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Керування користувачами</h1>
        <div className="text-sm text-gray-500">Всього: {data?.total}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">ID / Username</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Роль</th>
              <th className="px-6 py-4">Статус</th>
              <th className="px-6 py-4">Активність</th>
              <th className="px-6 py-4 text-right">Дії</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-400">#{user.id}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value })}
                    className="bg-transparent border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="READER">Читач (Reader)</option>
                    <option value="AUTHOR">Автор (Author)</option>
                    <option value="MODERATOR">Модератор</option>
                    <option value="ADMIN">Адмін</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  {user.isBlocked ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Заблоковано</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Активний</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Ніколи'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => blockMutation.mutate({ userId: user.id, currentStatus: !!user.isBlocked })}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    {user.isBlocked ? 'Розблокувати' : 'Заблокувати'}
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагінація */}
      <div className="flex justify-center gap-2 py-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
        >
          Назад
        </button>
        <span className="flex items-center px-4 font-medium">Сторінка {page}</span>
        <button
          disabled={!data || data.users.length < limit}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
        >
          Вперед
        </button>
      </div>
    </div>
  );
}