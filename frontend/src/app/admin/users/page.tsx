'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  // Стейти для фільтрів
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Дебаунс для пошуку: оновлює запит лише через 500мс після зупинки вводу
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Якщо змінився пошук або роль — повертаємось на 1-шу сторінку
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  // Отримання списку (залежить від фільтрів)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch, roleFilter],
    queryFn: () => adminService.getUsers(page, limit, debouncedSearch, roleFilter),
  });

  // Мутація блокування
  const blockMutation = useMutation({
    mutationFn: ({ userId, currentStatus }: { userId: number; currentStatus: boolean }) =>
      adminService.blockUser(userId, !currentStatus, !currentStatus ? 'rule violation' : 'unblock'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });


  // Мутація зміни ролі (з Optimistic Update)
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      adminService.changeRole(userId, role),

    onMutate: async ({ userId, role }) => {
      // 1. Зупиняємо всі активні запити, щоб вони не перезаписали наше оптимістичне оновлення
      await queryClient.cancelQueries({ queryKey: ['admin-users'] });

      // 2. Зберігаємо поточний стан кешу (робимо "знімок" для можливого відкату)
      const previousQueriesData = queryClient.getQueriesData({ queryKey: ['admin-users'] });

      // 3. Оптимістично оновлюємо кеш (шукаємо юзера по всіх закешованих сторінках і змінюємо йому роль)
      queryClient.setQueriesData({ queryKey: ['admin-users'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          users: oldData.users.map((user: any) =>
            user.id === userId ? { ...user, role } : user
          ),
        };
      });

      // 4. Повертаємо збережений знімок, щоб передати його в onError у разі невдачі
      return { previousQueriesData };
    },

    onError: (err: any, variables, context) => {
      // Якщо сервер повернув помилку (наприклад, модератор намагався призначити адміна)
      // Відкочуємо кеш до збереженого знімка
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err.response?.data?.message || 'Помилка при зміні ролі');
    },

    onSettled: () => {
      // У будь-якому випадку (успіх чи помилка) в кінці робимо фоновий запит,
      // щоб гарантовано синхронізувати UI з реальною базою даних
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },

    onSuccess: () => {
      toast.success('Роль успішно змінено');
    }
  });

  // Мутація видалення користувача
  const deleteMutation = useMutation({
    mutationFn: (userId: number) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Користувача назавжди видалено');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при видаленні (можливо, конфлікт бази даних)');
    }
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Керування користувачами</h1>
        <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-lg">
          Знайдено: {data?.total || 0}
        </div>
      </div>

      {/* Фільтри та пошук */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Пошук за нікнеймом або email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="ALL">Всі ролі</option>
            <option value="READER">Читачі</option>
            <option value="AUTHOR">Автори</option>
            <option value="MODERATOR">Модератори</option>
            <option value="ADMIN">Адміністратори</option>
          </select>
        </div>
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
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Завантаження даних...
                </td>
              </tr>
            ) : data?.users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  За вашим запитом нічого не знайдено
                </td>
              </tr>
            ) : (
              data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/users/${user.id}`} className="group">
                      <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-400">#{user.id}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => roleMutation.mutate({ userId: user.id, role: e.target.value })}
                      className="bg-transparent border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => blockMutation.mutate({ userId: user.id, currentStatus: !!user.isBlocked })}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {user.isBlocked ? 'Розблокувати' : 'Заблокувати'}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Ви впевнені, що хочете НАЗАВЖДИ видалити користувача ${user.username}? Цю дію неможливо скасувати!`)) {
                          deleteMutation.mutate(user.id);
                        }
                      }}
                      className="px-3 py-1 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагінація (Оновлена логіка блокування кнопки Вперед) */}
      <div className="flex justify-center items-center gap-4 py-4">
        <button
          disabled={page === 1 || isLoading}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
        >
          Назад
        </button>
        <span className="text-sm font-medium text-gray-600">
          Сторінка {page} з {data ? Math.max(1, Math.ceil(data.total / limit)) : 1}
        </span>
        <button
          disabled={!data || page >= Math.ceil(data.total / limit) || isLoading}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
        >
          Вперед
        </button>
      </div>
    </div>
  );
}