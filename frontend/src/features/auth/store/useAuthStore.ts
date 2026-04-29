import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '../types';

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
  user: getStoredUser(),
  token: Cookies.get('token') || null,

  setAuth: (user, token) => {
    Cookies.set('token', token, { expires: 30, path: '/', secure: true, sameSite: 'strict' });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user-storage', JSON.stringify(user));
    }
    set({ user, token });
  },

  logout: () => {
    Cookies.remove('token', { path: '/' });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('user-storage');
    }
    set({ user: null, token: null });
  },
}));