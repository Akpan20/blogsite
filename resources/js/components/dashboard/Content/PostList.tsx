import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePosts, useDeletePost } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PostForm from './PostForm';
import { Post } from '@/types';

export default function PostList() {
  const navigate = useNavigate();
  const { data: postsResponse, isLoading } = usePosts();
  const deletePost = useDeletePost();
  const [editPost, setEditPost] = useState<Post | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle both paginated and non-paginated responses
  // Laravel often returns { data: [...], meta: {...} } for paginated results
  const posts = Array.isArray(postsResponse) 
    ? postsResponse 
    : postsResponse?.data || [];

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(id);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditPost(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading posts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditPost(undefined)}>Create New Post</Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col h-full max-h-[85vh] overflow-hidden p-0">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle>{editPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              <DialogDescription>
                {editPost
                  ? 'Update your blog post details below.'
                  : 'Fill in the details to create a new post.'}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <PostForm post={editPost} onSuccess={handleSuccess} />
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
              <Button
                type="submit"
                form="post-form"
                disabled={deletePost.isPending}
                className="min-w-35"
              >
                {deletePost.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editPost ? (
                  'Update Post'
                ) : (
                  'Publish Post'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts?.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                <Link
                  to={`/posts/${post.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  {post.slug}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/posts/${post.slug}`)}
                >
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditPost(post);
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {posts?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                No posts yet. Create your first one!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Info (if paginated response) */}
      {!Array.isArray(postsResponse) && postsResponse?.meta && (
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <div>
            Showing {postsResponse.meta.from || 0} to {postsResponse.meta.to || 0} of{' '}
            {postsResponse.meta.total || 0} posts
          </div>
          <div className="flex gap-2">
            {postsResponse.meta.current_page > 1 && (
              <Button variant="outline" size="sm">Previous</Button>
            )}
            {postsResponse.meta.current_page < postsResponse.meta.last_page && (
              <Button variant="outline" size="sm">Next</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}