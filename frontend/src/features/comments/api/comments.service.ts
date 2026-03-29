import { apiClient } from '@/lib/axios';
import { Comment, CreateCommentDTO, UpdateCommentDTO } from '../types';

export const commentsService = {
  // Отримати коментарі для новели або розділу
  getComments: async (params: { novelId?: number; chapterId?: number }): Promise<Comment[]> => {
    const { data } = await apiClient.get<Comment[]>('/comments', { params });
    return data;
  },

  // Додати новий коментар або відповідь
  createComment: async (payload: CreateCommentDTO): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>('/comments', payload);
    return data;
  },

  // Відредагувати коментар
  updateComment: async (id: number, payload: UpdateCommentDTO): Promise<Comment> => {
    const { data } = await apiClient.patch<Comment>(`/comments/${id}`, payload);
    return data;
  },

  // Видалити коментар (софт-видалення: deleted = true)
  deleteComment: async (id: number): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  }
};