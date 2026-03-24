// src/features/auth/types.ts

export interface User {
  id: number;
  email: string;
  username: string | null;
  role: string;

  // Додаємо відсутні поля з бекенду:
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  data: {
    user: User;
    accessToken: string;
  };
}

export interface LoginDTO {
  email: string;
  password: string;
}