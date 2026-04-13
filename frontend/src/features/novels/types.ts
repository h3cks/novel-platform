import { User } from '../auth/types';

export type NovelStatus = 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'BLOCKED';

export interface Novel {
  id: number;
  title: string;
  description: string | null;
  status: NovelStatus;
  coverUrl: string | null;
  authorId: number;
  author?: User;
  wordCount: number | null;
  createdAt: string;
  updatedAt: string;

  genres?: { genre: { id: number; name: string } }[];
  tags?: { tag: { id: number; name: string } }[];
  chapters?: { id: number; title?: string; order?: number }[];

  ratings?: { score: number }[];
  _count?: { followers: number };
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
  id: number;
  novelId: number;
  novelTitle: string;
  chapterId: number;
  chapterNumber: number;
  chapterTitle: string;
  authorUsername: string;
  updatedAt: string;
}