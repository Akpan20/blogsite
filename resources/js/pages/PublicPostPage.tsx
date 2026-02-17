import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, User, Tag, FolderOpen, BookOpen, Eye, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { SEOHead } from '@/components/seo/SEOHead';
import { CommentSection } from '@/components/comments/CommentSection';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  is_premium: boolean;
  premium_tier: string | null;
  reading_time: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  author: {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    bio: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
  series: {
    id: number;
    title: string;
    slug: string;
  }[];
}

export default function PublicPostPage() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch post data
  const {
    data: post,
    isLoading,
    error,
  } = useQuery<Post>({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${slug}`);
      return data;
    },
    enabled: !!slug,
  });

  // Track view when post loads
  useEffect(() => {
    if (post?.id) {
      api.post(`/posts/${post.id}/track-view`).catch(() => {
        // Silently fail – view tracking is non‑critical
      });
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Post not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  // Prepare meta tags for SEO
  const metaTitle = post.meta_title || post.title;
  const metaDescription = post.meta_description || post.excerpt || post.content.substring(0, 160);
  const ogImage = post.og_image || '/default-og-image.png'; // fallback

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        ogImage={ogImage}
        ogType="article"
        twitterCard="summary_large_image"
      />

      <article className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.avatar || undefined} />
                <AvatarFallback>
                  {post.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </time>
            </div>

            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{post.reading_time} min read</span>
            </div>

            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.views_count} views</span>
            </div>

            {post.is_premium && (
              <Badge variant="premium" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                Premium
              </Badge>
            )}
          </div>

          {/* Category & Tags */}
          <div className="flex flex-wrap gap-4 items-center">
            {post.category && (
              <Link
                to={`/category/${post.category.slug}`}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <FolderOpen className="h-4 w-4" />
                {post.category.name}
              </Link>
            )}

            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-500" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tag/${tag.slug}`}
                    className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author bio */}
        {post.author.bio && (
          <Card className="mb-12">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar || undefined} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    About {post.author.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Series navigation (if in a series) */}
        {post.series && post.series.length > 0 && (
          <Card className="mb-12">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Part of a series: {post.series[0].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This post is part of the series “{post.series[0].title}”. 
                You can read the other parts below:
              </p>
              {/* You might need a separate endpoint to list series posts */}
              <Button variant="outline" asChild>
                <Link to={`/series/${post.series[0].slug}`}>
                  View all posts in series
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Comments ({post.comments_count})
          </h2>
          <CommentSection postId={post.id} />
        </section>
      </article>
    </>
  );
}