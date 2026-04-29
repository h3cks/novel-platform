export type UserRole = 'READER' | 'AUTHOR' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  emailConfirmed: boolean;
  createdAt: string;
  isBlocked: boolean;
  lastActive: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}