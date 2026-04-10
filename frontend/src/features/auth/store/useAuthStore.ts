import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '../types';

// Допоміжна функція для безпечного читання localStorage (щоб не падало при SSR Next.js)
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem('user-storage');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // При завантаженні сторінки відновлюємо юзера і токен
  user: getStoredUser(),
  token: Cookies.get('token') || null,

  setAuth: (user, token) => {
    // 1. Зберігаємо токен для Middleware
    Cookies.set('token', token, { expires: 30, path: '/' });

    // 2. Зберігаємо юзера для UI
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user-storage', JSON.stringify(user));
    }

    set({ user, token });
  },

  logout: () => {
    // Жорстко очищаємо ВСЕ при виході
    Cookies.remove('token', { path: '/' });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user-storage');
      // Очищаємо всі можливі залишки старого кешу Zustand, якщо вони були
      window.localStorage.removeItem('auth-storage');
    }
    set({ user: null, token: null });
  },
}));