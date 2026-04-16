'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
    refetchInterval: 30000, // Оновлювати кожні 30 секунд
  });

  if (isLoading) return <div className="p-8 animate-pulse text-gray-500 text-center">Завантаження статистики...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">Помилка завантаження даних.</div>;

  const cards = [
    { title: 'Користувачів всього', value: stats?.totalUsers, color: 'text-blue-600', link: '/admin/users' },
    { title: 'Зараз онлайн', value: stats?.onlineUsers, color: 'text-green-600', subtitle: 'за останні 15 хв' },
    { title: 'Нових новел', value: stats?.newNovels, color: 'text-purple-600', subtitle: 'за тиждень' },
    { title: 'Відкритих скарг', value: stats?.openReports, color: stats?.openReports && stats.openReports > 0 ? 'text-red-600' : 'text-gray-400', link: '/admin/reports' },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Моніторинг сайту</h1>
        <p className="text-gray-500">Загальні показники активності платформи</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
              <h3 className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value ?? 0}</h3>
              {card.subtitle && <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>}
            </div>
            {card.link && (
              <Link href={card.link} className="text-sm text-blue-600 hover:underline mt-4 inline-block font-medium">
                Детальніше &rarr;
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Швидкі дії</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/users" className="p-4 border rounded-lg hover:bg-gray-50 text-center transition">
              <span className="block text-2xl mb-1">👥</span>
              <span className="text-sm font-medium">Користувачі</span>
            </Link>
            <Link href="/admin/reports" className="p-4 border rounded-lg hover:bg-gray-50 text-center transition">
              <span className="block text-2xl mb-1">🚩</span>
              <span className="text-sm font-medium">Скарги</span>
            </Link>
            {/* Заглушки для майбутнього функціоналу */}
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center transition opacity-60 cursor-not-allowed">
              <span className="block text-2xl mb-1">🏷️</span>
              <span className="text-sm font-medium">Жанри/Теги</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center transition opacity-60 cursor-not-allowed">
              <span className="block text-2xl mb-1">📢</span>
              <span className="text-sm font-medium">Розсилка</span>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Технічний стан</h3>
          <p className="text-sm text-blue-800 mb-4">Система працює в штатному режимі. Усі сервіси активні.</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-blue-700">Backend API</span>
              <span className="text-green-600">Online</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-blue-700">Database (Prisma)</span>
              <span className="text-green-600">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}