import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Pencil, Trash2, Loader2, Eye, List, Grid,
  ExternalLink, FileText, Clock, BarChart2,
} from 'lucide-react';
import { usePosts, useDeletePost } from '@/hooks/usePosts';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import PostForm from './PostForm';
import { Post } from '@/types';

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  published: {
    dot:   'bg-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    label: 'Published',
  },
  draft: {
    dot:   'bg-yellow-400',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    label: 'Draft',
  },
  archived: {
    dot:   'bg-gray-400',
    badge: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    label: 'Archived',
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function PostList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const { data: posts = [], isLoading } = usePosts({ search: debouncedSearch });
  const deletePost = useDeletePost();
  const [editPost, setEditPost] = useState<Post | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(id);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditPost(undefined);
  };

  const openEdit = (post: Post) => {
    setEditPost(post);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading posts…</span>
      </div>
    );
  }

  return (
    <div className="relative">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Content</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-64">
              <SearchBar
                onSearch={setSearchQuery}
                showSuggestions={false}
                placeholder="Search posts…"
              />
            </div>

            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as 'list' | 'cards')}
              className="border rounded-lg p-0.5 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
            >
              <ToggleGroupItem value="list" aria-label="List view" className="px-2.5 py-1.5 rounded-md data-[state=on]:bg-white data-[state=on]:shadow-sm dark:data-[state=on]:bg-gray-700">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="cards" aria-label="Card view" className="px-2.5 py-1.5 rounded-md data-[state=on]:bg-white data-[state=on]:shadow-sm dark:data-[state=on]:bg-gray-700">
                <Grid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditPost(undefined)}>+ New Post</Button>
              </DialogTrigger>
              <DialogContent className="flex flex-col h-full max-h-[85vh] overflow-hidden p-0 sm:max-w-4xl">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                  <DialogTitle>{editPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                  <DialogDescription>
                    {editPost ? 'Update your blog post details below.' : 'Fill in the details to create a new post.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <PostForm post={editPost} onSuccess={handleSuccess} />
                </div>
                <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
                  <Button type="submit" form="post-form" disabled={deletePost.isPending} className="min-w-32">
                    {deletePost.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                    ) : editPost ? 'Update Post' : 'Publish Post'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* List view */}
      {viewMode === 'list' ? (
        posts.length === 0 ? (
          <EmptyState searching={!!searchQuery} onNew={() => setIsDialogOpen(true)} />
        ) : (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Post</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24 text-center">Status</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28 text-center hidden sm:block">Published</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32 text-right">Actions</span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group"
                >
                  <div className="min-w-0">
                    <button
                      onClick={() => navigate(`/content/${post.slug}`)}
                      className="text-left font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block max-w-full"
                    >
                      {post.title}
                    </button>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <Link to={`/content/${post.slug}`} className="hover:text-blue-500 truncate max-w-180px">
                          {post.slug}
                        </Link>
                      </span>
                      {post.reading_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.reading_time} min read
                        </span>
                      )}
                      {post.views_count !== undefined && (
                        <span className="flex items-center gap-1">
                          <BarChart2 className="h-3 w-3" />
                          {post.views_count.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-24 flex justify-center">
                    <StatusBadge status={post.status} />
                  </div>
                  <div className="w-28 text-center text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </div>
                  <div className="w-32 flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" title="Preview" onClick={() => navigate(`/content/${post.slug}`)} className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {post.status === 'published' && (
                      <Button variant="ghost" size="sm" title="Open public post" onClick={() => window.open(`/posts/${post.slug}`, '_blank')} className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" title="Edit" onClick={() => openEdit(post)} className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(post.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length > 0 ? posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white">{post.title}</h3>
                  <StatusBadge status={post.status} />
                </div>
                {post.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-4">
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  {post.views_count !== undefined && (
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views_count}</span>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex gap-1.5 justify-end bg-gray-50 dark:bg-gray-950">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/content/${post.slug}`)}>
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
                {post.status === 'published' && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(`/posts/${post.slug}`, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-1" /> Public
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )) : (
            <div className="col-span-full">
              <EmptyState searching={!!searchQuery} onNew={() => setIsDialogOpen(true)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ searching, onNew }: { searching: boolean; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-gray-400" />
      </div>
      <p className="font-semibold text-gray-700 dark:text-gray-300">
        {searching ? 'No posts match your search' : 'No posts yet'}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {searching ? 'Try a different keyword.' : 'Get started by writing your first post.'}
      </p>
      {!searching && (
        <Button className="mt-6" onClick={onNew}>+ Create your first post</Button>
      )}
    </div>
  );
}