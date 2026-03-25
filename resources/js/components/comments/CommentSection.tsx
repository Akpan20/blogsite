import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { CommentItem } from './CommentItem';
import { Comment } from '@/types';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Echo from 'laravel-echo';

interface CommentSectionProps {
  postId: number;
  echo?: Echo;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, echo }) => {
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data.data || res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
      setError('Could not load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time updates via Echo
  useEffect(() => {
    if (!echo) return;

    const channel = echo.channel(`post.${postId}`);

    channel.listen('.comment.posted', (event: { comment: Comment }) => {
      setComments((prev) => {
        if (event.comment.parent_id) {
          return prev.map((c) =>
            c.id === event.comment.parent_id
              ? {
                  ...c,
                  replies: [...(c.replies || []), event.comment],
                  replies_count: (c.replies_count || 0) + 1,
                }
              : c
          );
        }
        return [event.comment, ...prev];
      });
      toast.info('New comment added!');
    });

    channel.listen('.comment.updated', (event: { comment: Comment }) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === event.comment.id) return { ...c, ...event.comment };
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === event.comment.id ? { ...r, ...event.comment } : r
              ),
            };
          }
          return c;
        })
      );
    });

    channel.listen('.comment.deleted', (event: { comment_id: number }) => {
      setComments((prev) =>
        prev.filter((c) => {
          if (c.id === event.comment_id) return false;
          if (c.replies) {
            c.replies = c.replies.filter((r) => r.id !== event.comment_id);
            c.replies_count = c.replies.length;
          }
          return true;
        })
      );
    });

    channel.listen(
      '.comment.reaction.updated',
      (event: {
        comment_id: number;
        reactions_count: Record<string, number>;
        user_reaction: string | null;
      }) => {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === event.comment_id) {
              return { ...c, reactions_count: event.reactions_count };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === event.comment_id ? { ...r, reactions_count: event.reactions_count } : r
                ),
              };
            }
            return c;
          })
        );
      }
    );

    return () => {
      echo.leave(`post.${postId}`);
    };
  }, [echo, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      if (user) {
        response = await api.post(`/posts/${postId}/comments`, {
          content: newComment.trim(),
        });
      } else {
        if (!guestName.trim()) {
          setError('Please enter your name to comment as a guest.');
          toast.error('Name is required for guest comments');
          setIsSubmitting(false);
          return;
        }

        response = await api.post('/comments/guest', {
          post_id: postId,
          content: newComment.trim(),
          name: guestName.trim(),
          email: guestEmail.trim() || null,
        });
      }

      const newCommentData = response.data.comment || response.data;
      setComments((prev) => [newCommentData, ...prev]);

      setNewComment('');
      if (!user) {
        // Optional: keep name
        // setGuestName('');
        setGuestEmail('');
      }

      toast.success('Comment posted!');
    } catch (err: any) {
      console.error('Error posting comment:', err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Authentication issue - please try logging in again.'
          : 'Failed to post comment. Please try again.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    if (!content.trim()) return;

    try {
      let response;

      if (user) {
        response = await api.post(`/posts/${postId}/comments`, {
          content: content.trim(),
          parent_id: parentId,
        });
      } else {
        if (!guestName.trim()) {
          toast.error('Please enter your name to reply as a guest.');
          return;
        }
        response = await api.post('/comments/guest', {
          post_id: postId,
          content: content.trim(),
          name: guestName.trim(),
          email: guestEmail.trim() || null,
          parent_id: parentId,
        });
      }

      const reply = response.data.comment || response.data;
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: [...(c.replies || []), reply],
                replies_count: (c.replies_count || 0) + 1,
              }
            : c
        )
      );

      toast.success('Reply posted!');
    } catch (err: any) {
      toast.error('Failed to post reply');
      console.error(err);
    }
  };

  const handleUpdate = async (commentId: number, content: string) => {
    if (!content.trim()) return;

    try {
      const res = await api.put(`/comments/${commentId}`, { content: content.trim() });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) return res.data.comment || res.data;
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? res.data.comment || res.data : r
              ),
            };
          }
          return c;
        })
      );

      toast.success('Comment updated');
    } catch (err: any) {
      toast.error('Failed to update comment');
      console.error(err);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment? This cannot be undone.')) return;

    try {
      await api.delete(`/comments/${commentId}`);

      setComments((prev) =>
        prev.filter((c) => {
          if (c.id === commentId) return false;
          if (c.replies) {
            c.replies = c.replies.filter((r) => r.id !== commentId);
            c.replies_count = c.replies.length;
          }
          return true;
        })
      );

      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error('Failed to delete comment');
      console.error(err);
    }
  };

  const handleReaction = async (commentId: number, reactionType: string) => {
    try {
      const res = await api.post(`/comments/${commentId}/reactions`, { type: reactionType });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              reactions_count: res.data.reactions_count,
              user_reaction: res.data.user_reaction,
            };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? {
                      ...r,
                      reactions_count: res.data.reactions_count,
                      user_reaction: res.data.user_reaction,
                    }
                  : r
              ),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      toast.error('Failed to update reaction');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <Card className="p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name *"
                required
                className="w-full"
              />
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full"
              />
            </div>
          )}

          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-100px mb-4 resize-y"
            disabled={isSubmitting}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {!user && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mr-auto">
                Commenting as guest •{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </a>{' '}
                for more features
              </p>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim() || (!user && !guestName.trim())}
              className="min-w-140px"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card className="p-10 text-center bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No comments yet</p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Be the first to share your thoughts!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReaction={handleReaction}
            />
          ))}
        </div>
      )}
    </div>
  );
};