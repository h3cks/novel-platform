'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { reportsService, ReportDTO } from '../api/reports.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface ReportModalProps {
  targetType: ReportDTO['targetType'];
  targetId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal = ({ targetType, targetId, isOpen, onClose }: ReportModalProps) => {
  const { isAuthenticated } = useAuthStore();
  const { register, handleSubmit, reset } = useForm<{ reason: string; detail: string }>();

  const reportMutation = useMutation({
    mutationFn: (data: { reason: string; detail: string }) =>
      reportsService.createReport({ targetType, targetId, ...data }),
    onSuccess: () => {
      alert('Ваша жалоба успешно отправлена модераторам.');
      reset();
      onClose();
    },
    onError: () => {
      alert('Произошла ошибка при отправке жалобы.');
    }
  });

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
          <p className="mb-4 text-gray-700">Вам нужно войти в систему, чтобы отправить жалобу.</p>
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-md">Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Пожаловаться на контент</h2>

        <form onSubmit={handleSubmit((data) => reportMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Причина *</label>
            <select
              {...register('reason', { required: true })}
              className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Выберите причину...</option>
              <option value="SPAM">Спам или реклама</option>
              <option value="HARASSMENT">Оскорбления / Агрессия</option>
              <option value="PLAGIARISM">Плагиат</option>
              <option value="INAPPROPRIATE">Неприемлемый контент</option>
              <option value="OTHER">Другое</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Дополнительные детали (необязательно)</label>
            <textarea
              {...register('detail')}
              rows={3}
              className="w-full border p-2 rounded-md outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Опишите проблему подробнее..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {reportMutation.isPending ? 'Отправка...' : 'Отправить жалобу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};