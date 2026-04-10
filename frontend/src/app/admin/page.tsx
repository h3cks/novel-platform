'use client';


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers(1, 50),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number, role: any }) => adminService.changeRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (id: number) => adminService.blockUser(id, 'Адміністративне рішення'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <div className="animate-pulse p-4">Завантаження...</div>;

  const users = data?.users || [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Користувачі</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Username</th>
            <th className="p-4">Статус</th>
            <th className="p-4">Роль</th>
            <th className="p-4">Дії</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {users.map((user: any) => {
            const isSelf = user.id === currentUser?.id;

            // Перевірка на онлайн (активність за останні 15 хвилин)
            const lastActiveTime = new Date(user.lastActive).getTime();
            const isOnline = (Date.now() - lastActiveTime) < 15 * 60 * 1000;

            return (
              <tr key={user.id} className={`hover:bg-slate-50/50 ${user.isBlocked ? 'bg-red-50/30' : ''}`}>
                <td className="p-4 text-slate-500">#{user.id}</td>
                <td className="p-4 font-medium text-slate-900">
                  {user.username} {isSelf && <span className="text-xs text-indigo-500">(Ви)</span>}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-slate-600 text-xs">{isOnline ? 'Онлайн' : 'Офлайн'}</span>
                    {user.isBlocked && <span className="ml-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-2 py-0.5 rounded-full">БАН</span>}
                  </div>
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    disabled={roleMutation.isPending || isSelf}
                    onChange={(e) => roleMutation.mutate({ id: user.id, role: e.target.value })}
                    className="bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full px-2 py-1 outline-none border-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="READER">READER</option>
                    <option value="AUTHOR">AUTHOR</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleBlockMutation.mutate(user.id)}
                    disabled={toggleBlockMutation.isPending || isSelf}
                    className={`font-medium text-xs uppercase ${
                      isSelf ? 'text-slate-300 cursor-not-allowed' :
                        user.isBlocked ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    {user.isBlocked ? 'Розблокувати' : 'Заблокувати'}
                  </button>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}