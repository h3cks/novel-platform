'use client';

import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-blue-600">NovelHub</Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/novels" className="text-gray-600 hover:text-blue-600 font-medium">Каталог</Link>
            {isAuthenticated && (
              <Link href="/library" className="text-gray-600 hover:text-blue-600 font-medium">Моя Бібліотека</Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {(user?.role === 'AUTHOR' || user?.role === 'ADMIN') && (
                <Link href="/studio" className="text-sm bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200">
                  Студія Автора
                </Link>
              )}
              <Link href="/profile" className="text-gray-700 font-medium">{user?.username || 'Профіль'}</Link>
              <button onClick={handleLogout} className="text-red-500 text-sm hover:underline">Вийти</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Увійти</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};