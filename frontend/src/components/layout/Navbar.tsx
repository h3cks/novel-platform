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
  useEffect(() => setIsMounted(true), []);

  const isAuthenticated = !!token;

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-extrabold text-primary-600 tracking-tight hover:text-primary-700 transition-colors">
            NovelHub
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/novels" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Каталог</Link>
            {isMounted && isAuthenticated && (
              <Link href="/library" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Моя Бібліотека</Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-5">
          {!isMounted ? (
            <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-xl"></div>
          ) : isAuthenticated ? (
            <>
              {(user?.role === 'AUTHOR' || user?.role === 'ADMIN') && (
                <Link href="/studio" className="text-sm font-semibold bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors">
                  Студія Автора
                </Link>
              )}
              <Link href="/profile" className="text-slate-700 font-semibold hover:text-primary-600 transition-colors">
                {user?.username || 'Профіль'}
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 font-medium transition-colors">
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Увійти</Link>
              <Link href="/auth/register" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};