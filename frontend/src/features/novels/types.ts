import { User } from '../auth/types';

export type NovelStatus = 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'BLOCKED';

export interface Novel {
  id: number;
  title: string;
  description: string | null;
  status: NovelStatus;
  coverUrl: string | null;
  authorId: number;
  author?: User; // Опціонально, якщо бекенд повертає зв'язки (include)
  wordCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNovelDTO {
  title: string;
  description?: string;
}

export interface UpdateNovelDTO {
  title?: string;
  description?: string;
  coverUrl?: string;
  status?: NovelStatus;
}

export interface LatestUpdate {
  id: number; // ID глави або запису оновлення
  novelId: number;
  novelTitle: string;
  chapterId: number;
  chapterNumber: number;
  chapterTitle: string;
  authorUsername: string;
  updatedAt: string;
}