import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment, REACTION_EMOJIS, ReactionType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number, content: string) => Promise<void>;
  onUpdate: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onReaction: (commentId: number, reactionType: ReactionType) => Promise<void>;
  depth?: number; 
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  onReaction,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showReactions, setShowReactions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(true); // for deep threads

  const currentUserId = parseInt(localStorage.getItem('user_id') || '0', 10);
  const isOwner = comment.user_id === currentUserId;

  const maxDepthBeforeCollapse = 5;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
      // Force expand after new reply
      setExpanded(true);
    } catch (err) {
      console.error('Reply failed:', err);
      alert('Could not post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(comment.id, trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error('Edit failed:', err);
      alert('Could not update comment.');
      setEditContent(comment.content);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactionClick = async (type: ReactionType) => {
    try {
      await onReaction(comment.id, type);
    } catch (err) {
      console.error('Reaction failed:', err);
    }
    setShowReactions(false);
  };

  // Safely compute total reactions
  const reactionsCount = comment.reactions_count ?? {};
  const totalReactions = Object.values(reactionsCount).reduce((a, b) => a + (b ?? 0), 0);

  const hasReplies = Array.isArray(comment.replies) && comment.replies.length > 0;
  const isDeep = depth >= maxDepthBeforeCollapse;

  // Optional: log when rendering deep comments (remove in production)
  // if (depth > 2) {
  //   console.log(`Rendering depth ${depth} - comment ${comment.id} - ${comment.replies?.length || 0} replies`);
  // }

  return (
    <div
      className={`
        comment-thread
        relative pl-2.5rem ${depth > 0 ? 'mt-3' : 'mt-0'}
        ${depth > 0 ? 'border-l-2 border-gray-200 ml-4' : ''}
        ${depth >= 3 ? 'opacity-95' : ''}
      `}
    >
      <Card className="p-4 shadow-sm">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-sm">{comment.user?.name || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  {comment.is_edited && <span className="ml-1 italic text-xs">(edited)</span>}
                </div>
              </div>

              {isOwner && !isEditing && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete(comment.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Content or Edit form */}
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="mt-3 space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                  rows={3}
                  className="resize-y"
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap wrap-break-wordbreak-words leading-relaxed">
                {comment.content}
              </p>
            )}

            {/* Action bar */}
            {!isEditing && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {/* Reactions */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReactions((prev) => !prev)}
                  >
                    {comment.user_reaction
                      ? REACTION_EMOJIS[comment.user_reaction]
                      : '👍'}{' '}
                    React
                  </Button>

                  {showReactions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border shadow-lg rounded-lg p-2 flex gap-1 z-10">
                      {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleReactionClick(type)}
                          className={`text-2xl p-1 rounded hover:bg-gray-100 ${
                            comment.user_reaction === type ? 'bg-blue-50 ring-1 ring-blue-300' : ''
                          }`}
                          title={type}
                        >
                          {REACTION_EMOJIS[type]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying((prev) => !prev)}
                >
                  💬 Reply
                  {comment.replies_count > 0 && ` (${comment.replies_count})`}
                </Button>

                {/* Reaction summary */}
                {totalReactions > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(reactionsCount).map(([type, count]) =>
                      count ? (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs"
                        >
                          {REACTION_EMOJIS[type as ReactionType]} {count}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reply form */}
            {isReplying && (
              <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={isSubmitting || !replyContent.trim()}>
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Replies section */}
            {hasReplies && (
              <div className="mt-5">
                {isDeep && !expanded ? (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setExpanded(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Show {comment.replies!.length} nested replies...
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {comment.replies!.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        onReply={onReply}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onReaction={onReaction}
                        isReply={true}
                      />
                    ))}
                  </div>
                )}

                {isDeep && expanded && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setExpanded(false)}
                    className="mt-2 text-gray-500 hover:text-gray-700"
                  >
                    Collapse nested replies
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};