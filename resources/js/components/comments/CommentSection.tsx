import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { CommentItem } from './CommentItem';
import { Comment } from '@/types';
import api from '@/lib/api';
import Echo from 'laravel-echo';

interface CommentSectionProps {
  postId: number;
  echo?: Echo;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, echo }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel(`post.${postId}`);

    // Listen for new comments
    channel.listen('.comment.posted', (event: { comment: Comment }) => {
      setComments(prev => {
        if (event.comment.parent_id) {
          // It's a reply - add it to the parent comment's replies
          return prev.map(comment => {
            if (comment.id === event.comment.parent_id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), event.comment],
                replies_count: comment.replies_count + 1,
              };
            }
            return comment;
          });
        } else {
          // It's a root comment
          return [event.comment, ...prev];
        }
      });
    });

    // Listen for comment updates
    channel.listen('.comment.updated', (event: { comment: Comment }) => {
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === event.comment.id) {
            return { ...comment, ...event.comment };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === event.comment.id ? { ...reply, ...event.comment } : reply
              ),
            };
          }
          return comment;
        })
      );
    });

    // Listen for comment deletions
    channel.listen('.comment.deleted', (event: { comment_id: number }) => {
      setComments(prev => 
        prev.filter(comment => {
          if (comment.id === event.comment_id) return false;
          if (comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== event.comment_id);
            comment.replies_count = comment.replies.length;
          }
          return true;
        })
      );
    });

    // Listen for reaction updates
    channel.listen('.comment.reaction.updated', (event: {
      comment_id: number;
      reactions_count: Record<string, number>;
      user_reaction: string | null;
    }) => {
      setComments(prev =>
        prev.map(comment => {
          if (comment.id === event.comment_id) {
            return {
              ...comment,
              reactions_count: event.reactions_count,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === event.comment_id
                  ? { ...reply, reactions_count: event.reactions_count }
                  : reply
              ),
            };
          }
          return comment;
        })
      );
    });

    return () => {
      echo.leave(`post.${postId}`);
    };
  }, [echo, postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await api.post(`/posts/${postId}/comments`, {
        content: newComment,
      });

      // Add the comment to the list immediately (optimistic update)
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content,
        parent_id: parentId,
      });

      // Update the parent comment with the new reply
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
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error;
    }
  };

  const handleUpdate = async (commentId: number, content: string) => {
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
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

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
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleReaction = async (commentId: number, reactionType: string) => {
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
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <Card className="p-4">
        <form onSubmit={handleSubmit}>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="mb-3"
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </Card>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReaction={handleReaction}
            />
          ))
        )}
      </div>
    </div>
  );
};