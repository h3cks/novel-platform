import { User } from '@/features/auth/types';

export interface Comment {
  id: number;
  userId: number;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  novelId: number | null;
  chapterId: number | null;
  parentId: number | null;
  text: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[]; // Рекурсивна структура для відповідей
}

export interface CreateCommentDTO {
  novelId?: number;
  chapterId?: number;
  parentId?: number;
  text: string;
}

export interface UpdateCommentDTO {
  text: string;
}