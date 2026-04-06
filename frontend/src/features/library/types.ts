export interface Bookmark {
  id: number;
  novelId: number;
  userId: number;
  novel: {
    id: number;
    title: string;
    coverUrl?: string;
    author: { username: string };
  };
  createdAt: string;
}

export interface ReadingHistory {
  id: number;
  novelId: number;
  chapterId: number;
  lastReadAt: string;
  novel: {
    id: number;
    title: string;
    coverUrl?: string;
  };
  chapter: {
    id: number;
    title: string;
    number: number;
  };
}