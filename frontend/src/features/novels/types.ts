import { User } from '@/features/auth/types';

export type NovelStatus = 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'BLOCKED';

export interface Novel {
  id: number;
  authorId: number;
  author?: User; // Связь с автором
  title: string;
  description: string | null;
  status: NovelStatus;
  coverUrl: string | null;
  autoPublished: boolean;
  publishedAt: string | null;
  wordCount: number | null;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNovelDTO {
  title: string;
  description?: string;
  coverUrl?: string;
}

export interface UpdateNovelDTO {
  title?: string;
  description?: string;
  coverUrl?: string;
  status?: NovelStatus;
}