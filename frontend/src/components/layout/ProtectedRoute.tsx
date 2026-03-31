'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const isAuthenticated = !!token;

  useEffect(() => {
    setIsMounted(true);

    // Якщо компонент змонтувався і токена немає - редирект
    if (!isAuthenticated) {
      router.push('/auth/login'); // Виправлено шлях
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/'); // Немає доступу
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  // Показуємо лоадер, поки монтується АБО якщо йде редирект
  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="animate-pulse text-gray-500 font-medium">Перевірка сесії...</div>
      </div>
    );
  }

  // Якщо ролі обмежені, а користувач не має потрібної ролі, нічого не рендеримо
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};