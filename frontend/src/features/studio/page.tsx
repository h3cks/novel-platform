'use client';

import { useQuery } from '@tanstack/react-query';
import { novelsService } from '@/features/novels/api/novels.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import Link from 'next/link';

export default function StudioDashboard() {
  const { user } = useAuthStore();

  const { data: myNovels, isLoading } = useQuery({
    queryKey: ['novels', 'my', user?.id],
    queryFn: () => novelsService.getNovels({ authorId: user?.id, limit: 50 }),
    enabled: !!user?.id,
  });

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Студія Автора</h1>
        <Link
          href="/studio/novels/create"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          + Створити новелу
        </Link>
      </div>

      {isLoading ? (
        <div>Завантаження ваших робіт...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Назва</th>
              <th className="p-4 font-medium text-gray-600">Статус</th>
              <th className="p-4 font-medium text-gray-600">Дії</th>
            </tr>
            </thead>
            <tbody className="divide-y">
            {myNovels?.data?.map((novel) => (
              <tr key={novel.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-900">{novel.title}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      novel.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {novel.status}
                    </span>
                </td>
                <td className="p-4 space-x-4">
                  <Link href={`/studio/novels/${novel.id}/edit`} className="text-blue-600 hover:underline">Редагувати</Link>
                  <Link href={`/studio/novels/${novel.id}/chapters`} className="text-purple-600 hover:underline">Розділи</Link>
                </td>
              </tr>
            ))}
            {myNovels?.data?.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">У вас ще немає створених новел.</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}