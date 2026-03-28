export interface User {
  id: number;
  email: string;
  username: string | null;
  role: string;
  displayName?: string | null;
  avatarUrl?: string | null;
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

export interface RegisterDTO {
  email: string;
  username: string;
  password: string;
}