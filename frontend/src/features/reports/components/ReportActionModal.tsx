'use client';

import { useState } from 'react';
import { Report, ReportStatus } from '../types';
import { useUpdateReport } from '../hooks/useUpdateReport';

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
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Обробка скарги #{report.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Новий статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReportStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPEN">Відкрита</option>
              <option value="IN_PROGRESS">В роботі</option>
              <option value="RESOLVED">Вирішена</option>
              <option value="DISMISSED">Відхилена</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Коментар модератора (внутрішній)</label>
            <textarea
              value={moderatorComment}
              onChange={(e) => setModeratorComment(e.target.value)}
              rows={3}
              placeholder="Вкажіть причину рішення..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium">
              Скасувати
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
              {isPending ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};