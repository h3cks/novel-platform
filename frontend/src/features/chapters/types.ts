export interface Chapter {
  id: number;
  novelId: number;
  title: string;
  content: string; // HTML контент від TipTap редактора
  order: number;
  wordCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterDTO {
  novelId: number;
  title: string;
  content: string;
  order?: number;
}

export interface UpdateChapterDTO {
  title?: string;
  content?: string;
  order?: number;
}