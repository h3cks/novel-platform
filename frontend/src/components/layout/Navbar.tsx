'use client';

import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { notificationsService } from '@/features/notifications/api/notifications.service';

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Запобігання Hydration Error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Логіка закриття меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isAuthenticated = !!token;

  // ДОДАНО: Запит на отримання сповіщень для підрахунку непрочитаних
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.getNotifications,
    enabled: isMounted && isAuthenticated && !!user,
    refetchInterval: 60000, // Автоматичне оновлення кожні 60 секунд
  });

  // ДОДАНО: Підрахунок непрочитаних повідомлень
  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    queryClient.clear(); // Очищаємо кеш при виході, щоб інші не бачили чужих даних
    router.push('/auth/login');
  };

  // Закриваємо меню при кліку на лінк
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Fallback для аватара (перша літера юзернейма)
  const avatarLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Логотип та основні посилання */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight hover:text-indigo-700 transition-colors">
            NovelHub
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/novels" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Каталог</Link>
          </div>
        </div>

        {/* Права частина навігації */}
        <div className="flex items-center space-x-5">
          {!isMounted ? (
            // Скелетон під час завантаження (запобігає морганню)
            <div className="w-10 h-10 bg-slate-100 animate-pulse rounded-full"></div>
          ) : isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              {/* Кнопка відкриття меню */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-0.5 transition-shadow relative"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized={user.avatarUrl.includes('google')} // якщо це зовнішній URL без налаштувань
                    />
                  ) : (
                    <span>{avatarLetter}</span>
                  )}
                </div>
                {/* ДОДАНО: Червона крапка на аватарці, якщо є непрочитані */}
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Випадаюче меню */}
              <div
                className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden transition-all duration-200 origin-top-right ${
                  isMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                }`}
              >
                {/* Інформація про юзера в шапці меню */}
                <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.username}</p>
                  <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
                    {user?.role === 'AUTHOR' ? 'Автор' : user?.role === 'ADMIN' ? 'Адмін' : user?.role === 'MODERATOR' ? 'Модератор' : 'Читач'}
                  </span>
                </div>

                <div className="py-2 flex flex-col">
                  {/* Мій профіль */}
                  <Link href="/profile" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Мій профіль
                  </Link>

                  {/* Налаштування */}
                  <Link href="/settings" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Налаштування
                  </Link>

                  {/* Моя бібліотека */}
                  <Link href="/library" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    Моя бібліотека
                  </Link>

                  {/* ДОДАНО: Повідомлення з бейджем кількості */}
                  <Link href="/notifications" onClick={handleLinkClick} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      Повідомлення
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Студія */}
                <div className="py-2 border-t border-slate-100">
                  <Link
                    href="/studio"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {user?.role === 'READER' ? 'Стати автором' : 'Студія Автора'}
                  </Link>
                </div>

                {/* Адмін-панель */}
                {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                  <div className="py-2 border-t border-slate-100">
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Адмін-панель
                    </Link>
                  </div>
                )}

                {/* Вихід */}
                <div className="py-2 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Вихід із акаунта
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors">Увійти</Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};