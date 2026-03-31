import { apiClient } from '@/lib/axios';
import { Comment, CreateCommentDTO } from '../types';

interface GetCommentsParams {
  novelId?: string | number;
  chapterId?: string | number;
}

export const commentsService = {
  getComments: async (params: GetCommentsParams): Promise<Comment[]> => {
    const { data } = await apiClient.get<Comment[]>('/comments', { params });
    return data;
  },

  createComment: async (payload: CreateCommentDTO): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>('/comments', payload);
    return data;
  },

  deleteComment: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },
};