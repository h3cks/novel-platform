import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додаємо інтерцептор запитів
apiClient.interceptors.request.use(
  (config) => {
    const storageData = localStorage.getItem('novelhub-auth');
    if (storageData) {
      try {
        const parsedData = JSON.parse(storageData);
        const token = parsedData.state?.token;
        if (token) {
          // Безпечне додавання заголовка
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth token', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Додаємо інтерцептор відповідей (щоб ловити 401 і чистити стейт, якщо токен протух)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Якщо бекенд каже, що токен недійсний, чистимо localStorage
      // Це запобігає безкінечним циклам редиректів
      localStorage.removeItem('novelhub-auth');

      // Тільки якщо ми в браузері (не на сервері Next.js)
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);