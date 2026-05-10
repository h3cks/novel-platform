'use client';

import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { ReportActionModal } from './ReportActionModal';
import { Report } from '../types';

const TABS = [
  { id: 'ALL', label: 'Всі' },
  { id: 'OPEN', label: 'Відкриті' },
  { id: 'IN_PROGRESS', label: 'В роботі' },
  { id: 'RESOLVED', label: 'Вирішені' },
  { id: 'DISMISSED', label: 'Відхилені' }
];

export const ReportList = () => {
  const [filter, setFilter] = useState<string>('OPEN');

  const { data: rawReports, isLoading, isError, error } = useReports(filter === 'ALL' ? undefined : filter);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const responseData = rawReports as any;
  const reports: Report[] = Array.isArray(responseData)
    ? responseData
    : responseData?.items || responseData?.data?.items || responseData?.data || [];

  const statusColors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800 border-red-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    DISMISSED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const statusTranslations: Record<string, string> = {
    OPEN: 'Відкрита',
    IN_PROGRESS: 'В роботі',
    RESOLVED: 'Вирішена',
    DISMISSED: 'Відхилена',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Фільтри */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Таблиця */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
          <tr className="bg-white text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200">
            <th className="px-6 py-4 font-bold">ID</th>
            <th className="px-6 py-4 font-bold">Скаржник</th>
            <th className="px-6 py-4 font-bold">Об'єкт</th>
            <th className="px-6 py-4 font-bold">Причина</th>
            <th className="px-6 py-4 font-bold">Статус</th>
            <th className="px-6 py-4 font-bold text-right">Дії</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700 bg-white">

          {isLoading && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500 animate-pulse font-medium">
                Завантаження скарг...
              </td>
            </tr>
          )}

          {isError && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-red-500 bg-red-50">
                <div className="font-bold text-lg mb-1">Помилка завантаження даних</div>
                <div className="text-sm font-medium">
                  Причина: {(error as any)?.response?.data?.message || (error as any)?.message || 'Невідома помилка сервера'}
                </div>
              </td>
            </tr>
          )}

          {!isLoading && !isError && reports.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-bold text-gray-900">Скарг немає</span>
                  <span className="text-sm mt-1">У цій категорії все спокійно.</span>
                </div>
              </td>
            </tr>
          )}

          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">#{report.id}</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-indigo-600">
                {report.reporter?.username || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-md">
                    {report.targetType}
                  </span>
                <span className="ml-2 font-medium">#{report.targetId}</span>
              </td>
              <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-700" title={report.reason}>
                {report.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[report.status] || 'bg-gray-100'}`}>
                    {statusTranslations[report.status] || report.status}
                  </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="text-indigo-600 hover:text-indigo-900 font-bold px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
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