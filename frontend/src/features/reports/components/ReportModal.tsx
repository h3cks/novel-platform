'use client';

import { useState } from 'react';
import { useCreateReport } from '../hooks/useCreateReport';
import { ReportTargetType } from '@/features/reports/types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: number | string;
  targetType: ReportTargetType;
}

const REPORT_REASONS = [
  'Спам або реклама',
  'Неприйнятний контент',
  'Образи або мова ворожнечі',
  'Порушення авторських прав',
  'Інше'
];

export const ReportModal = ({ isOpen, onClose, targetId, targetType }: ReportModalProps) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');

  // Використовуємо ваш хук
  const { mutate: submitReport, isPending } = useCreateReport();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(
      {
        targetType,
        targetId: Number(targetId), // Ваш сервіс очікує number
        reason,
        detail
      },
      {
        onSuccess: () => {
          alert('Скаргу успішно відправлено!'); // Замініть на toast.success, якщо використовуєте react-hot-toast
          setDetail('');
          onClose();
        },
        onError: () => {
          alert('Помилка відправки скарги.'); // Замініть на toast.error
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Поскаржитися</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold p-1">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Причина</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Деталі (необов'язково)</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Опишіть проблему..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-20 resize-none outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md font-medium transition">
              Скасувати
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-red-500 text-white rounded-md font-medium hover:bg-red-600 disabled:opacity-50 transition">
              {isPending ? 'Відправка...' : 'Надіслати скаргу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};