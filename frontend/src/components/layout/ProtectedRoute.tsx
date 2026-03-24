'use client';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/'); // Немає доступу
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  if (!isMounted || !isAuthenticated) return <div className="flex h-screen items-center justify-center">Завантаження сесії...</div>;

  return <>{children}</>;
};