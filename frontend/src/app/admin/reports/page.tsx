'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/features/reports/api/reports.service';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function AdminReportsPage() {
  const [filter, setFilter] = useState<string>('OPEN');
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports', filter],
    queryFn: () => reportsService.getReports(filter === 'ALL' ? undefined : filter),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'RESOLVED' | 'DISMISSED' }) =>
      reportsService.updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    }
  });

  return (
    <ProtectedRoute allowedRoles={['MODERATOR', 'ADMIN']}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Панель модерації жалоб</h1>

        {/* Фильтры */}
        <div className="flex gap-4 mb-6">
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Таблиця */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">ID</th>
              <th className="p-4 font-medium text-gray-600">Тип контенту</th>
              <th className="p-4 font-medium text-gray-600">Причина</th>
              <th className="p-4 font-medium text-gray-600">Деталі</th>
              <th className="p-4 font-medium text-gray-600">Дії</th>
            </tr>
            </thead>
            <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Загрузка...</td></tr>
            ) : reports?.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Скарг не знайдено.</td></tr>
            ) : (
              reports?.map((report: any) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-medium">#{report.id}</td>
                  <td className="p-4 text-sm">
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                        {report.targetType} (ID: {report.targetId})
                      </span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-red-600">{report.reason}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={report.detail}>
                    {report.detail || '—'}
                  </td>
                  <td className="p-4 space-x-2">
                    {report.status !== 'RESOLVED' && report.status !== 'DISMISSED' && (
                      <>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'RESOLVED' })}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 text-xs font-medium"
                        >
                          Закінчити
                        </button>
                        <button
                          onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'DISMISSED' })}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-xs font-medium"
                        >
                          Відмовити
                        </button>
                      </>
                    )}
                    <a
                      href={`/admin/review/${report.targetType.toLowerCase()}/${report.targetId}`}
                      className="text-blue-600 hover:underline text-xs"
                      target="_blank" rel="noreferrer"
                    >
                      Подивитися
                    </a>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}