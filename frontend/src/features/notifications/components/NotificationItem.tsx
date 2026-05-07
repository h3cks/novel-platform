'use client';

import Link from 'next/link';
import { Notification } from '../types';
import { useMarkAsRead } from '../hooks/useMarkAsRead';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markSingle } = useMarkAsRead();

  // Обробник кліку на все сповіщення (позначаємо як прочитане)
  const handleNotificationClick = () => {
    if (!notification.read) {
      markSingle.mutate(notification.id);
    }
  };

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

  let icon = (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>
  );

  if (notification.type === 'NEW_CHAPTER') {
    icon = (
      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.782 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

  let href: string | null = null;
  const tType = notification.targetType?.toUpperCase();

  if (tType === 'NOVEL' && notification.targetId) {
    href = `/novels/${notification.targetId}`;
  } else if (tType === 'CHAPTER' && notification.targetId) {
    // В ідеалі тут має бути посилання на читалку, якщо бекенд дає novelId
    href = `/novels`;
  } else if (tType === 'COMMENT' && notification.targetId) {
    // Перехід до коментарів конкретної новели
    href = `/novels/${notification.targetId}#comments`;
  }

  const wrapperClasses = `block p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
    !notification.read ? 'bg-blue-50/50' : 'bg-white'
  }`;

  const innerContent = (
    <div className="flex gap-4 items-start">
      {icon}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
          {notification.message}
        </p>
        <span className="text-xs text-gray-400 mt-1 block">{date}</span>
      </div>
      {!notification.read && (
        <button
          onClick={handleDotClick}
          className="w-3 h-3 bg-blue-600 rounded-full shrink-0 hover:bg-blue-800 transition-colors"
          title="Позначити як прочитане"
        />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleNotificationClick} className={wrapperClasses}>
        {innerContent}
      </Link>
    );
  }

  return (
    <div onClick={handleNotificationClick} className={wrapperClasses}>
      {innerContent}
    </div>
  );
};