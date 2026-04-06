import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie'; // Додано
import { User } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        // Дублюємо токен у куки для Next.js Middleware
        Cookies.set('token', token, { expires: 7, path: '/' });
        set({ user, token });
      },
      logout: () => {
        // Очищаємо куку при виході
        Cookies.remove('token', { path: '/' });
        set({ user: null, token: null });
      },
    }),
    {
      name: 'novelhub-auth',
    }
  )
);