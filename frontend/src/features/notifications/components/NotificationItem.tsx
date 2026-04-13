'use client';

import Link from 'next/link';
import { Notification } from '../types';
import { useMarkAsRead } from '../hooks/useMarkAsRead';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markSingle } = useMarkAsRead();

  // Обробник кліку на все сповіщення (перехід + прочитання)
  const handleNotificationClick = () => {
    if (!notification.read) {
      markSingle.mutate(notification.id);
    }
  };

  // Обробник кліку ТІЛЬКИ на синю крапку (без переходу)
  const handleDotClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notification.read) {
      markSingle.mutate(notification.id);
    }
  };

  const date = new Date(notification.createdAt).toLocaleDateString('uk-UA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Визначаємо іконку та колір залежно від типу події
  let icon = (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );

  if (notification.type === 'NEW_CHAPTER') {
    icon = (
      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    );
  } else if (notification.type === 'NEW_COMMENT') {
    icon = (
      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    );
  }

  // Генеруємо посилання залежно від targetType
  let href = '#';
  const tType = notification.targetType?.toUpperCase();

  if (tType === 'NOVEL' && notification.targetId) {
    href = `/novels/${notification.targetId}`;
  } else if (tType === 'CHAPTER' && notification.targetId) {
    // Fallback на випадок старих сповіщень у базі
    href = `/novels`;
  }

  return (
    <Link
      href={href}
      onClick={handleNotificationClick}
      className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : 'bg-white'}`}
    >
      <div className="flex gap-4 items-start">
        {icon}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">{date}</p>
        </div>
        {!notification.read && (
          <button
            onClick={handleDotClick}
            disabled={markSingle.isPending}
            className="w-3 h-3 bg-blue-600 rounded-full shrink-0 hover:bg-blue-800 transition-colors cursor-pointer"
            title="Позначити як прочитане"
            aria-label="Позначити як прочитане"
          />
        )}
      </div>
    </Link>
  );
};