import { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

export default function CommentItem({ comment, onUpdate }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { data: session } = useSession();

  const handleLike = async () => {
    try {
      await axios.post(`/api/comments/${comment.id}/like`);
      onUpdate();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await axios.post('/api/comments', {
        content: replyContent,
        postId: comment.postId,
        parentId: comment.id,
      });
      setReplyContent('');
      setIsReplying(false);
      onUpdate();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  return (
    <div className="border-l-2 border-gray-200 pl-4">
      <div className="flex items-start gap-3">
        <img
          src={comment.user.image || '/default-avatar.png'}
          alt={comment.user.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.user.name}</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1">{comment.content}</p>
          
          <div className="mt-2 flex items-center gap-4 text-sm">
            <button
              onClick={handleLike}
              className="text-gray-500 hover:text-blue-600"
            >
              {comment.likes.length} Likes
            </button>
            {session && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-gray-500 hover:text-blue-600"
              >
                Reply
              </button>
            )}
          </div>

          {isReplying && (
            <form onSubmit={handleSubmitReply} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full p-2 border rounded-lg mb-2"
                placeholder="Write a reply..."
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 bg-gray-200 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}