import apiClient from './apiClient';

interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const postService = {
  create: (data: Partial<Post>) => apiClient.post('/posts', data),
  getAll: (params?: PaginationParams) => apiClient.get('/posts', { params }),
  getOne: (id: string) => apiClient.get(`/posts/${id}`),
  update: (id: string, data: Partial<Post>) => apiClient.put(`/posts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
};
