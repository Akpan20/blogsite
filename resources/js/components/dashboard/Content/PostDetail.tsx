"use client";

import { useNavigate, useParams } from 'react-router-dom';
import { usePost, useDeletePost } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Trash2, Calendar, Eye } from 'lucide-react';
import PremiumContentLock from '@/components/subscriptions/PremiumContentLock';
import Sidebar from '@/components/layout/Sidebar';
import RelatedPosts from '@/components/content/RelatedPosts';
import SeriesProgressBar from '@/components/content/SeriesProgressBar';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PostForm from './PostForm';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePost(slug);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const deletePost = useDeletePost();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(Number(id), {
        onSuccess: () => navigate('/content'),
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading post...</div>;
  if (!post) return <div className="p-8 text-red-500 text-center">Post not found</div>;

  // Check premium access
  const hasAccess = 
    subscription?.plan?.slug === 'premium' || 
    subscription?.plan?.slug === 'pro' ||
    subscription?.plan?.slug === 'basic-monthly' ||
    user?.role === 'admin';

  // Show premium lock if post is premium and user doesn't have access
  if (post.is_premium && !hasAccess) {
    return (
      <>
        <Helmet>
          <title>{post.title} | Your Blogsite</title>
          <meta name="description" content={post.excerpt || 'Premium content - Subscribe to read more'} />
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Button variant="ghost" onClick={() => navigate('/content')} className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>

          <PremiumContentLock 
            tier={post.premium_tier} 
            excerpt={post.excerpt}
            title={post.title}
            onUpgrade={() => navigate('/subscription/plans')} 
          />
        </div>
      </>
    );
  }

  // Format dates
  const createdDate = new Date(post.created_at);
  const updatedDate = new Date(post.updated_at);

  // Get series ID if post is part of a series
  const seriesId = post.series && post.series.length > 0 ? post.series[0].id : null;

  return (
    <>
      {/* SEO & Social Meta Tags */}
      <Helmet>
        <title>{post.title} | Your Blogsite</title>
        <meta name="description" content={post.excerpt || post.content.slice(0, 160) + '...'} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://yourblogsite.com/posts/${post.slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.content.slice(0, 160) + '...'} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://yourblogsite.com/posts/${post.slug}`} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.content.slice(0, 160) + '...'} />
        {post.featured_image && <meta name="twitter:image" content={post.featured_image} />}
      </Helmet>

      {/* Article Schema (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.content.slice(0, 160) + '...',
          datePublished: createdDate.toISOString(),
          dateModified: updatedDate.toISOString(),
          author: {
            "@type": "Person",
            name: post.author?.name || "Akaninyene",
          },
          publisher: {
            "@type": "Organization",
            name: "Your Blogsite",
            logo: {
              "@type": "ImageObject",
              url: "https://yourblogsite.com/logo.png",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://yourblogsite.com/posts/${post.slug}`,
          },
          url: `https://yourblogsite.com/posts/${post.slug}`,
          image: post.featured_image || '/default-post.jpg',
        })}
      </script>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content - 8 columns */}
            <div className="lg:col-span-8">
              {/* Back & Admin Controls */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => navigate('/content')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Posts
                </Button>

                {/* Only show edit/delete to admins */}
                {user?.role === 'admin' && (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Series Progress Bar */}
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

              {/* Post Article */}
              <article className="bg-white rounded-lg shadow-sm p-8 md:p-12 mb-8">
                <header className="mb-10">
                  {/* Premium Badge */}
                  {post.is_premium && (
                    <Badge variant="secondary" className="mb-4">
                      Premium Content
                    </Badge>
                  )}

                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={createdDate.toISOString()}>
                        Published {createdDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>

                    {post.updated_at !== post.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={updatedDate.toISOString()}>
                          Updated {updatedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    )}

                    {post.views_count !== undefined && (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{post.views_count.toLocaleString()} views</span>
                      </div>
                    )}

                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  {post.excerpt && (
                    <p className="mt-6 text-xl text-gray-700 italic leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </header>

                {/* Main Content */}
                <div 
                  className="prose prose-lg prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:underline prose-headings:scroll-mt-20 prose-img:rounded-lg prose-img:shadow-md max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Footer metadata */}
                <footer className="mt-16 pt-8 border-t text-sm text-gray-600">
                  <p>Posted in <strong>Blog</strong> • Last updated <time dateTime={updatedDate.toISOString()}>{updatedDate.toLocaleDateString()}</time></p>
                </footer>
              </article>

              {/* Related Posts */}
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

            {/* Sidebar - 4 columns, sticky */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-8 space-y-6">
                <Sidebar variant="blog" sticky={false} />
                
                {/* Related Posts Compact */}
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

      {/* Edit Dialog */}
      {user?.role === 'admin' && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
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