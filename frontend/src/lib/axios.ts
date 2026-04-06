// src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Тут в ідеалі має бути логіка оновлення токена (Refresh Token)
      // Якщо рефреш не вдався - робимо повний логаут
      useAuthStore.getState().logout();
      // Очищення кешу викличеться на стороні UI, або через window.location
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'; // Надійний редирект при "смерті" сесії
      }
    }
    return Promise.reject(error);
  }
);