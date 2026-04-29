// src/features/comments/api/comments.service.ts
import { apiClient } from '@/lib/axios';
import { Comment, CreateCommentDTO } from '../types';

interface GetCommentsParams {
  novelId?: string | number;
  chapterId?: string | number;
  page?: number;
  limit?: number;
}

export const commentsService = {
  getComments: async (params: GetCommentsParams): Promise<Comment[]> => {
    let url = '';
    if (params.novelId && params.chapterId) {
      url = `/novels/${params.novelId}/chapters/${params.chapterId}/comments`;
    } else if (params.novelId) {
      url = `/novels/${params.novelId}/comments`;
    } else {
      return [];
    }

    const { data } = await apiClient.get(url, {
      params: { page: params.page, limit: params.limit }
    });

    return data.data?.items || data.items || data.data || data || [];
  },

  createComment: async (payload: CreateCommentDTO): Promise<Comment> => {
    let url = '';

    if (payload.parentId) {
      url = `/comments/${payload.parentId}/replies`;
    }

    else if (payload.novelId && payload.chapterId) {
      url = `/novels/${payload.novelId}/chapters/${payload.chapterId}/comments`;
    }

    else if (payload.novelId) {
      url = `/novels/${payload.novelId}/comments`;
    } else {
      throw new Error('Invalid target for comment');
    }

    const { data } = await apiClient.post(url, {
      text: payload.text,
      parentId: payload.parentId,
    });

    return data.data?.comment || data.comment || data.data || data;
  },

  deleteComment: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },
};