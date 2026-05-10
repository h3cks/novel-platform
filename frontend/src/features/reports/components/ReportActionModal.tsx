'use client';

import { useState } from 'react';
import { Report, ReportStatus } from '../types';
import { useUpdateReport } from '../hooks/useUpdateReport';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ReportActionModalProps {
  report: Report;
  onClose: () => void;
}

export const ReportActionModal = ({ report, onClose }: ReportActionModalProps) => {
  const { mutate: updateReport, isPending } = useUpdateReport();
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [moderatorComment, setModeratorComment] = useState(report.moderatorComment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateReport(
      { id: report.id, data: { status, moderatorComment } },
      {
        onSuccess: () => {
          toast.success('Рішення по скарзі збережено!');
          onClose();
        },
        onError: () => {
          toast.error('Помилка при збереженні рішення.');
        }
      }
    );
  };

  // Генеруємо посилання на об'єкт, щоб модератор міг його перевірити
  const getTargetLink = () => {
    const type = report.targetType?.toUpperCase();
    if (type === 'NOVEL') return `/novels/${report.targetId}`;
    if (type === 'USER') return `/users/${report.targetId}`;
    return null;
  };

  const targetLink = getTargetLink();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col transform transition-all">

        {/* Шапка модалки */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <h3 className="text-xl font-extrabold text-slate-900">
            Розгляд скарги <span className="text-indigo-600">#{report.id}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 font-bold text-2xl leading-none transition-colors">
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">

          {/* Детальна інформація про скаргу */}
          <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-slate-200/60">
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Скаржник</span>
                <span className="font-bold text-slate-900">{report.reporter?.username || 'Невідомий'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Тип об'єкта</span>
                <span className="font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md text-xs uppercase tracking-wider">
                  {report.targetType}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">ID об'єкта</span>
                <span className="font-bold text-slate-900">#{report.targetId}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Причина скарги</span>
              <p className="text-rose-700 font-bold bg-white p-3 rounded-lg border border-rose-100 shadow-sm">
                {report.reason}
              </p>
            </div>

            {report.detail && (
              <div className="mb-4">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Додаткові деталі від користувача</span>
                <p className="text-slate-700 text-sm bg-white p-3 rounded-lg border border-slate-200 italic shadow-sm">
                  "{report.detail}"
                </p>
              </div>
            )}

            {targetLink && (
              <div className="mt-5 pt-4 border-t border-slate-200/60 flex justify-end">
                <Link
                  href={targetLink}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Відкрити контент для перевірки
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Форма прийняття рішення */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Рішення (Новий статус)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-900 font-semibold cursor-pointer shadow-sm"
              >
                <option value="OPEN">🔴 Відкрита (Ще не розглянуто)</option>
                <option value="IN_PROGRESS">🟡 В роботі (Перевіряється)</option>
                <option value="RESOLVED">🟢 Вирішена (Вжито заходів)</option>
                <option value="DISMISSED">⚪ Відхилена (Порушень не знайдено)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Коментар модератора <span className="text-slate-400 font-medium ml-1">(видимий лише для адміністрації)</span>
              </label>
              <textarea
                value={moderatorComment}
                onChange={(e) => setModeratorComment(e.target.value)}
                rows={3}
                placeholder="Вкажіть, чому скаргу відхилено або які дії вжито (напр., 'Новелу заблоковано')..."
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none text-slate-900 shadow-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">
                Скасувати
              </button>
              <button type="submit" disabled={isPending} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200">
                {isPending ? 'Збереження...' : 'Підтвердити рішення'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};