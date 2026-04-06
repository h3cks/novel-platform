'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from './api/admin-users.service';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  // Примітка: якщо бекенд ще не підтримує /admin/users, цей запит поверне 404.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersService.getUsers(1, 50),
    retry: 1
  });

  const blockMutation = useMutation({
    mutationFn: (id: number) => adminUsersService.blockUser(id, 'Порушення правил'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <div className="animate-pulse">Завантаження користувачів...</div>;
  if (isError) return <div className="text-red-500">Не вдалося завантажити список користувачів (перевірте наявність API).</div>;

  const users = data?.users || [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Користувачі</h1>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
          <tr>
            <th className="p-4 font-semibold">ID</th>
            <th className="p-4 font-semibold">Username</th>
            <th className="p-4 font-semibold">Email</th>
            <th className="p-4 font-semibold">Роль</th>
            <th className="p-4 font-semibold">Дії</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {users.length === 0 ? (
            <tr><td colSpan={5} className="p-4 text-center text-slate-500">Немає даних</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="p-4 text-slate-500">#{user.id}</td>
                <td className="p-4 font-medium text-slate-900">{user.username}</td>
                <td className="p-4 text-slate-600">{user.email}</td>
                <td className="p-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                      {user.role}
                    </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => blockMutation.mutate(user.id)}
                    disabled={blockMutation.isPending}
                    className="text-red-600 hover:text-red-800 font-medium text-xs uppercase"
                  >
                    Заблокувати
                  </button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}