import { User } from '../auth/types';

export interface Comment {
  id: number;
  userId: number;
  user: User;
  novelId?: number | null;
  chapterId?: number | null;
  parentId?: number | null;
  text: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[]; // Вкладені коментарі (відповіді)
}

export interface CreateCommentDTO {
  text: string;
  novelId?: number;
  chapterId?: number;
  parentId?: number;
}