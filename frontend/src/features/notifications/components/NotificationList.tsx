'use client';

import { useNotifications } from '../hooks/useNotifications';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { NotificationItem } from './NotificationItem';

export const NotificationList = () => {
  const { data: notifications, isLoading, isError } = useNotifications();
  const { markAll } = useMarkAsRead();

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100">
        Не вдалося завантажити сповіщення.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="font-bold text-gray-900">
          Сповіщення {unreadCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">{unreadCount}</span>}
        </h2>

        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {markAll.isPending ? 'Зачекайте...' : 'Прочитати все'}
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
        {notifications?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            У вас немає нових сповіщень.
          </div>
        ) : (
          notifications?.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
};