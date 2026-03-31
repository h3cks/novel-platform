'use client';

import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthenticated = !!token;

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">NovelHub</Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/novels" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Каталог</Link>
            {isMounted && isAuthenticated && (
              <Link href="/library" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Моя Бібліотека</Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-5">
          {!isMounted ? (
            <div className="w-32 h-8 bg-gray-100 animate-pulse rounded-md"></div>
          ) : isAuthenticated ? (
            <>
              {/* Сповіщення */}
              <Link href="/notifications" className="text-gray-500 hover:text-blue-600 transition-colors relative" title="Сповіщення">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </Link>

              {/* Меню Автора */}
              {(user?.role === 'AUTHOR' || user?.role === 'ADMIN') && (
                <div className="flex items-center gap-2 border-l border-r border-gray-200 px-4">
                  <Link href="/studio/novels/create" className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors font-bold">
                    + Створити
                  </Link>
                  <Link href="/studio" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Студія
                  </Link>
                </div>
              )}

              {/* Профіль та Вихід */}
              <Link href="/profile" className="text-gray-800 font-bold hover:text-blue-600 transition-colors ml-2">
                {user?.username || 'Профіль'}
              </Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 font-medium transition-colors ml-2">
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 font-medium">Увійти</Link>
              <Link href="/auth/register" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium shadow-sm">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};