import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { comments } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PostDetailProps {
  post: any;
  onSubscribe?: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onSubscribe }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [postComments, setPostComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const { data } = await comments.create({
        postId: post.id,
        content: comment
      });
      setPostComments([data, ...postComments]);
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremiumLocked = post.premium && (!user || !user.hasSubscription);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
              <div className="mt-2 flex items-center space-x-4 text-gray-500">
                <Link href={`/profile/${post.author.username}`}>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                  </div>
                </Link>
                <span>·</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {post.premium && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Premium
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isPremiumLocked ? (
            <div className="text-center py-12 space-y-4">
              <h3 className="text-xl font-semibold">Premium Content</h3>
              <p className="text-gray-600">
                Subscribe to access this premium content
              </p>
              <Button onClick={onSubscribe}>
                Subscribe to {post.author.name}
              </Button>
            </div>
          ) : (
            <div className="prose max-w-none">
              {post.content}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {post.categories.map((category: any) => (
              <Link 
                key={category.id} 
                href={`/category/${category.name}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
              >
                {category.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.map((tag: any) => (
              <Link 
                key={tag.id} 
                href={`/tag/${tag.name}`}
                className="px-2 py-1 text-sm text-blue-600 hover:underline"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {!isPremiumLocked && (
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleComment} className="space-y-4">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <Link href="/login">
                  <Button variant="link">Log in to comment</Button>
                </Link>
              </div>
            )}

            <div className="mt-8 space-y-6">
              {postComments.map((comment: any) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/profile/${comment.author.username}`}
                          className="font-medium hover:underline"
                        >
                          {comment.author.name}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {postComments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PostDetail;