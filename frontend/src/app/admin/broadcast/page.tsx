'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminService } from '@/features/admin/api/admin.service';
import { toast } from 'react-hot-toast';

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const broadcastMutation = useMutation({
    mutationFn: () => adminService.sendBroadcast(title, message),
    onSuccess: () => {
      toast.success('Системне повідомлення успішно надіслано всім користувачам!');
      // Очищаємо форму після успішної відправки
      setTitle('');
      setMessage('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка при відправці розсилки');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error("Заповніть усі поля");
      return;
    }

    // Захист від випадкової масової розсилки
    if (window.confirm('Ви впевнені, що хочете надіслати це повідомлення УСІМ активним користувачам платформи?')) {
      broadcastMutation.mutate();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Системні повідомлення</h1>
        <p className="text-gray-500 text-sm mt-1">
          Текст, який ви напишете нижче, отримають у свої сповіщення абсолютно всі незаблоковані користувачі сайту.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Заголовок сповіщення <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Наприклад: Технічні роботи на сервері"
            disabled={broadcastMutation.isPending}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Текст повідомлення <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
            placeholder="Опишіть деталі для користувачів..."
            disabled={broadcastMutation.isPending}
            maxLength={1000}
            required
          />
          <div className="text-right mt-1">
             <span className={`text-xs ${message.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
               {message.length} / 1000
             </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200 flex-1 mr-4">
            <strong>Увага:</strong> Дія незворотня. Сповіщення миттєво з'являться в акаунтах.
          </p>
          <button
            type="submit"
            disabled={!title.trim() || !message.trim() || broadcastMutation.isPending}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {broadcastMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Відправка...
              </>
            ) : (
              'Відправити всім 📢'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}