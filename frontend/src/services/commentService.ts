import apiClient from './apiClient';

interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const commentService = {
  create: (data: Partial<Comment>) => apiClient.post('/comments', data),
  getPostComments: (postId: string, params?: PaginationParams) => 
    apiClient.get(`/comments/post/${postId}`, { params }),
  update: (id: string, data: Partial<Comment>) => apiClient.put(`/comments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/comments/${id}`),
};
