'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import Link from 'next/link';

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-audit-logs', page],
    queryFn: () => adminService.getAuditLogs(page, limit),
  });

  // Функція-помічник для красивого виводу дій
  const renderActionText = (log: any) => {
    const actor = (
      <Link href={`/admin/users/${log.actorId}`} className="font-bold text-indigo-600 hover:underline">
        @{log.actor.username}
      </Link>
    );

    const targetTypeTranslation: Record<string, string> = {
      'USER': 'користувача',
      'NOVEL': 'новелу',
      'COMMENT': 'коментар',
      'GENRE': 'жанр',
      'TAG': 'тег'
    };
    const translatedTarget = targetTypeTranslation[log.targetType] || log.targetType;

    // Формуємо посилання на об'єкт, якщо це можливо
    const targetLink = log.targetType === 'USER'
      ? <Link href={`/admin/users/${log.targetId}`} className="font-bold text-gray-700 hover:underline">ID: {log.targetId}</Link>
      : <span className="font-bold text-gray-700">ID: {log.targetId}</span>;

    let detailsStr = '';
    if (log.details) {
      try {
        const parsed = JSON.parse(log.details);
        if (parsed.oldRole && parsed.newRole) {
          detailsStr = ` (з ${parsed.oldRole} на ${parsed.newRole})`;
        }
      } catch (e) {}
    }

    switch (log.action) {
      case 'BLOCK_USER':
        return <>{actor} заблокував {translatedTarget} {targetLink}</>;
      case 'UNBLOCK_USER':
        return <>{actor} розблокував {translatedTarget} {targetLink}</>;
      case 'CHANGE_ROLE':
        return <>{actor} змінив роль для {translatedTarget} {targetLink}{detailsStr}</>;
      case 'DELETE_USER':
        return <>{actor} назавжди видалив {translatedTarget} {targetLink}</>;
      case 'DELETE_NOVEL':
        return <>{actor} назавжди видалив {translatedTarget} {targetLink}</>;
      default:
        return <>{actor} виконав дію <span className="px-1 bg-gray-100 rounded text-xs font-mono">{log.action}</span> над {translatedTarget} {targetLink}</>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Логи модерації</h1>
          <p className="text-sm text-gray-500 mt-1">Історія всіх адміністративних дій на платформі</p>
        </div>
        <div className="text-sm text-gray-500 font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          Всього записів: {data?.total || 0}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Дата і Час</th>
              <th className="px-6 py-4">Дія</th>
              <th className="px-6 py-4">Причина / Деталі</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">Завантаження логів...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-red-500">Помилка завантаження логів</td>
              </tr>
            ) : data?.logs?.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">Жодних дій ще не зафіксовано.</td>
              </tr>
            ) : (
              data?.logs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('uk-UA', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {renderActionText(log)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 italic">
                    {log.reason ? `«${log.reason}»` : <span className="text-gray-300 not-italic">—</span>}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагінація */}
      <div className="flex justify-center items-center gap-4 py-4">
        <button
          disabled={page === 1 || isLoading}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors bg-white shadow-sm"
        >
          Новіші
        </button>
        <span className="text-sm font-medium text-gray-600">
          Сторінка {page} з {data ? Math.max(1, Math.ceil(data.total / limit)) : 1}
        </span>
        <button
          disabled={!data || page >= Math.ceil(data.total / limit) || isLoading}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors bg-white shadow-sm"
        >
          Старіші
        </button>
      </div>
    </div>
  );
}