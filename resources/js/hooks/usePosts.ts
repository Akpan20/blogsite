import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Post } from '@/types';
import { toast } from 'sonner';

type PostIdentifier = number | string;

/**
 * Fetch all posts (authenticated user's posts)
 */
export const usePosts = () => {
  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data } = await api.get('/posts');
      return data;
    },
  });
};

/**
 * Fetch a single post by ID or slug
 * Backend supports both numeric ID and string slug
 */
export const usePost = (identifier: PostIdentifier | null | undefined) => {
  return useQuery<Post, AxiosError>({
    queryKey: ['post', identifier],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${identifier}`);
      return data;
    },
    enabled: !!identifier, // Prevents unnecessary fetches when identifier is falsy
    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
};

/**
 * Create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Post,
    AxiosError<{ message?: string }>,
    Omit<Post, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'slug'> // slug usually auto-generated
  >({
    mutationFn: async (newPost) => {
      const { data } = await api.post('/posts', newPost);
      return data;
    },
    onSuccess: (createdPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-posts'] });
      // Optional: optimistically add to list if you want instant UI feedback
      // queryClient.setQueryData(['posts'], (old: Post[] | undefined) => [...(old ?? []), createdPost]);
      toast.success('Post created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create post';
      toast.error(message);
    },
  });
};

/**
 * Update an existing post
 */
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Post,
    AxiosError<{ message?: string }>,
    { id: PostIdentifier } & Partial<Post>
  >({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put(`/posts/${id}`, updates);
      return data;
    },
    onSuccess: (updatedPost) => {
      // Invalidate list + specific post detail
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', updatedPost.id] });
      queryClient.invalidateQueries({ queryKey: ['post', updatedPost.slug] });
      queryClient.invalidateQueries({ queryKey: ['recent-posts'] });
      toast.success('Post updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update post';
      toast.error(message);
    },
  });
};

/**
 * Delete a post
 */
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<{ message?: string }>, PostIdentifier>({
    mutationFn: async (identifier) => {
      await api.delete(`/posts/${identifier}`);
    },
    onSuccess: (_, identifier) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', identifier] });
      queryClient.invalidateQueries({ queryKey: ['recent-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message);
    },
  });
};