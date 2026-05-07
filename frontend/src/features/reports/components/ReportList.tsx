'use client';

import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { ReportActionModal } from './ReportActionModal';
import { Report } from '../types';

export const ReportList = () => {
  const [filter, setFilter] = useState<string>('OPEN');
  const { data: reports, isLoading, isError } = useReports(filter === 'ALL' ? undefined : filter);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    DISMISSED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Фільтри */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-2">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {f === 'ALL' ? 'Всі' : f}
          </button>
        ))}
      </div>

      {/* Таблиця */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
            <th className="px-6 py-4 font-medium">ID</th>
            <th className="px-6 py-4 font-medium">Скаржник</th>
            <th className="px-6 py-4 font-medium">Об'єкт</th>
            <th className="px-6 py-4 font-medium">Причина</th>
            <th className="px-6 py-4 font-medium">Статус</th>
            <th className="px-6 py-4 font-medium text-right">Дії</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
          {isLoading && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500 animate-pulse">
                Завантаження скарг...
              </td>
            </tr>
          )}
          {!isLoading && reports?.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Немає скарг у цій категорії. Все спокійно!
              </td>
            </tr>
          )}
          {reports?.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{report.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{report.reporter?.username || 'Unknown'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-xs font-bold text-gray-500 uppercase">{report.targetType}</span> #{report.targetId}
              </td>
              <td className="px-6 py-4 max-w-xs truncate" title={report.reason}>
                {report.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[report.status] || 'bg-gray-100'}`}>
                    {report.status}
                  </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-blue-600 hover:text-blue-900 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Розглянути
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <ReportActionModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
};