"use client";

import { useNavigate, useParams } from 'react-router-dom';
import { usePost, useDeletePost } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Trash2, Calendar, Eye, Clock, Tag } from 'lucide-react';
import PremiumContentLock from '@/components/subscriptions/PremiumContentLock';
import Sidebar from '@/components/layout/Sidebar';
import RelatedPosts from '@/components/content/RelatedPosts';
import SeriesProgressBar from '@/components/content/SeriesProgressBar';
import { marked } from 'marked';
import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PostForm from './PostForm';

// Configure marked once
marked.setOptions({ breaks: true, gfm: true });

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePost(slug);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const deletePost = useDeletePost();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Parse markdown → HTML, memoized so it only re-runs when content changes
  const renderedContent = useMemo(() => {
    if (!post?.content) return '';
    return marked.parse(post.content) as string;
  }, [post?.content]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(post!.id, {
        onSuccess: () => navigate('/content'),
      });
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm">Loading post...</span>
        </div>
      </div>
    );
  }

  // ─── Not found ──────────────────────────────────────────────────────────────
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Post not found</p>
        <p className="text-gray-500 dark:text-gray-400">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/content')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Posts
        </Button>
      </div>
    );
  }

  // ─── Premium gate ───────────────────────────────────────────────────────────
  const hasAccess =
    subscription?.plan?.slug === 'premium' ||
    subscription?.plan?.slug === 'pro' ||
    subscription?.plan?.slug === 'basic-monthly' ||
    user?.role === 'admin';

  if (post.is_premium && !hasAccess) {
    return (
      <>
        <Helmet>
          <title>{post.title} | Your Blogsite</title>
          <meta name="description" content={post.excerpt || 'Premium content — subscribe to read more'} />
        </Helmet>
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Button variant="ghost" onClick={() => navigate('/content')} className="mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Posts
            </Button>
            <PremiumContentLock
              tier={post.premium_tier}
              excerpt={post.excerpt}
              title={post.title}
              onUpgrade={() => navigate('/subscription/plans')}
            />
          </div>
        </div>
      </>
    );
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const createdDate  = new Date(post.created_at);
  const updatedDate  = new Date(post.updated_at);
  const isUpdated    = post.updated_at !== post.created_at;
  const seriesId     = post.series?.length ? post.series[0].id : null;
  const siteUrl      = 'https://yourblogsite.com';
  const canonicalUrl = `${siteUrl}/posts/${post.slug}`;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── SEO ─────────────────────────────────────────────────────────────── */}
      <Helmet>
        <title>{post.title} | Your Blogsite</title>
        <meta name="description" content={post.excerpt || post.content.slice(0, 160) + '...'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title"       content={post.title} />
        <meta property="og:description" content={post.excerpt || post.content.slice(0, 160) + '...'} />
        <meta property="og:type"        content="article" />
        <meta property="og:url"         content={canonicalUrl} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.content.slice(0, 160) + '...'} />
        {post.featured_image && <meta name="twitter:image" content={post.featured_image} />}
      </Helmet>

      {/* ── JSON-LD ─────────────────────────────────────────────────────────── */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || post.content.slice(0, 160) + '...',
          datePublished: createdDate.toISOString(),
          dateModified: updatedDate.toISOString(),
          image: post.featured_image || `${siteUrl}/default-post.jpg`,
          url: canonicalUrl,
          author: {
            '@type': 'Person',
            name: post.author?.name || 'Author',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Your Blogsite',
            logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        })}
      </script>

      {/* ── Page ────────────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-slate-100 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Main column ─────────────────────────────────────────────── */}
            <div className="lg:col-span-8">

              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => navigate('/content')}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Posts
                </Button>

                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                      <Pencil className="h-4 w-4 mr-1.5" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Series progress */}
              {seriesId && (
                <div className="mb-6">
                  <SeriesProgressBar
                    postId={post.id}
                    seriesId={seriesId}
                    variant="detailed"
                    showNavigation={true}
                  />
                </div>
              )}

              {/* Article card */}
              <article className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 md:p-12 mb-8">

                {/* ── Header ──────────────────────────────────────────────── */}
                <header className="mb-10 pb-8 border-b border-gray-100 dark:border-gray-800">

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.is_premium && (
                      <Badge variant="secondary">⭐ Premium</Badge>
                    )}
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                    {post.category && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: post.category.color, color: post.category.color }}
                      >
                        {post.category.icon} {post.category.name}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-5 text-gray-900 dark:text-white">
                    {post.title}
                  </h1>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={createdDate.toISOString()}>
                        {createdDate.toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </time>
                    </span>

                    {isUpdated && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Updated {updatedDate.toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    )}

                    {post.views_count !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {post.views_count.toLocaleString()} views
                      </span>
                    )}

                    {post.reading_time && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {post.reading_time} min read
                      </span>
                    )}

                    {post.author && (
                      <span className="flex items-center gap-1.5">
                        By <strong className="text-gray-700 dark:text-gray-300">{post.author.name}</strong>
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        >
                          <Tag className="h-3 w-3" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 italic leading-relaxed pl-4 border-l-4 border-blue-400 dark:border-blue-600">
                      {post.excerpt}
                    </p>
                  )}
                </header>

                {/* ── Body — parsed markdown ───────────────────────────────── */}
                <div
                  className="
                    prose prose-lg max-w-none
                    dark:prose-invert
                    prose-headings:font-bold prose-headings:scroll-mt-20
                    prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-800 dark:prose-p:text-gray-300
                    prose-p:leading-8 prose-p:mb-5
                    prose-a:text-blue-600 dark:prose-a:text-blue-400
                    prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-em:text-gray-700 dark:prose-em:text-gray-300
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                    prose-li:text-gray-800 dark:prose-li:text-gray-300 prose-li:mb-1.5
                    prose-blockquote:not-italic prose-blockquote:border-l-4
                    prose-blockquote:border-blue-400 dark:prose-blockquote:border-blue-600
                    prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30
                    prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-lg
                    prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                    prose-code:text-blue-700 dark:prose-code:text-blue-300
                    prose-code:bg-blue-50 dark:prose-code:bg-blue-950/40
                    prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
                    prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-5
                    prose-pre:shadow-lg prose-pre:overflow-x-auto
                    prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-10
                    prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
                    prose-table:text-sm
                    prose-th:bg-gray-50 dark:prose-th:bg-gray-800
                    prose-th:text-gray-900 dark:prose-th:text-white
                  "
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />

                {/* ── Footer ──────────────────────────────────────────────── */}
                <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      {post.category && (
                        <>Posted in <strong className="text-gray-700 dark:text-gray-300">{post.category.name}</strong> • </>
                      )}
                      Last updated{' '}
                      <time dateTime={updatedDate.toISOString()}>
                        {updatedDate.toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </time>
                    </p>
                    {post.author && (
                      <p>Written by <strong className="text-gray-700 dark:text-gray-300">{post.author.name}</strong></p>
                    )}
                  </div>
                </footer>
              </article>

              {/* Related posts grid */}
              <RelatedPosts
                currentPostId={post.id}
                limit={3}
                variant="grid"
                showExcerpt={true}
                showAuthor={false}
                showCategory={true}
                showImage={false}
              />
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-8 space-y-6">
                <Sidebar variant="blog" sticky={false} />
                <RelatedPosts
                  currentPostId={post.id}
                  limit={5}
                  variant="compact"
                  showExcerpt={false}
                  showAuthor={false}
                  showCategory={true}
                  showImage={false}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ── Edit dialog (admin only) ─────────────────────────────────────────── */}
      {user?.role === 'admin' && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>Make changes to your post below.</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-6">
              <PostForm post={post} onSuccess={() => setIsEditOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}