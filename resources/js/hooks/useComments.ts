import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { api } from '@/lib/api';

export const useComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data.data || response.data);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: number) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content,
        parent_id: parentId,
      });

      if (parentId) {
        // It's a reply
        setComments(prev =>
          prev.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data.comment],
                replies_count: comment.replies_count + 1,
              };
            }
            return comment;
          })
        );
      } else {
        // It's a root comment
        setComments(prev => [response.data.comment, ...prev]);
      }

      return response.data.comment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const updateComment = async (commentId: number, content: string) => {
    try {
      const response = await api.put(`/comments/${commentId}`, { content });

      setComments(prev =>
        prev.map(comment => {
          if (comment.id === commentId) {
            return response.data.comment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId ? response.data.comment : reply
              ),
            };
          }
          return comment;
        })
      );

      return response.data.comment;
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);

      setComments(prev =>
        prev.filter(comment => {
          if (comment.id === commentId) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== commentId);
            comment.replies_count = comment.replies.length;
          }
          return true;
        })
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  const toggleReaction = async (commentId: number, reactionType: string) => {
    try {
      const response = await api.post(`/comments/${commentId}/reactions`, {
        type: reactionType,
      });

      setComments(prev =>
        prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              reactions_count: response.data.reactions_count,
              user_reaction: response.data.user_reaction,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      reactions_count: response.data.reactions_count,
                      user_reaction: response.data.user_reaction,
                    }
                  : reply
              ),
            };
          }
          return comment;
        })
      );

      return response.data;
    } catch (err) {
      console.error('Error toggling reaction:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    isLoading,
    error,
    setComments,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
    toggleReaction,
  };
};