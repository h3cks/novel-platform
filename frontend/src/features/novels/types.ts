export interface Novel {
  id: number;
  authorId: number;
  title: string;
  description: string | null;
  status: 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'BLOCKED';
  coverUrl: string | null;
  createdAt: string;
}

export interface NovelFilters {
  page?: number;
  limit?: number;
  status?: string;
  authorId?: number;
}