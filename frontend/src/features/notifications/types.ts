export interface Notification {
  id: number;
  userId: number | null;
  type: string; // Наприклад: 'NEW_CHAPTER', 'NEW_COMMENT', 'SYSTEM'
  targetType: string | null; // 'NOVEL', 'COMMENT'
  targetId: number | null;
  taskId: number | null;
  actorId: number | null;
  message: string;
  read: boolean;
  createdAt: string;
}