"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { marked } from 'marked';
import { Calendar, Tag, FolderOpen, BookOpen, Eye, MessageSquare } from 'lucide-react';
import { ScrollTriggeredNewsletter } from '@/components/newsletter/ScrollTriggeredNewsletter';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useScrollProgress } from '@/hooks/useScrollProgress';
import api from '@/lib/api';
import { SEOHead } from '@/components/seo/SEOHead';
import { CommentSection } from '@/components/comments/CommentSection';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import RelatedPosts from '@/components/content/RelatedPosts';

// --- Custom Markdown Renderer for Lazy Loading & SEO ---
const renderer = new marked.Renderer();

renderer.image = (href, title, text) => {
  return `
    <figure class="my-8 group">
      <img 
        src="${href}" 
        alt="${text}" 
        title="${title || text || ''}" 
        loading="lazy" 
        class="rounded-xl shadow-lg w-full h-auto border border-gray-100 dark:border-gray-800 transition-transform duration-300 group-hover:scale-[1.01] cursor-zoom-in"
      />
      ${title ? `<figcaption class="text-center text-sm text-gray-500 mt-3 italic">${title}</figcaption>` : ''}
    </figure>
  `;
};

marked.setOptions({ breaks: true, gfm: true, renderer });

// --- Interface ---
interface Post {
  id: number; title: string; content: string; excerpt: string; slug: string;
  status: string; is_premium: boolean; reading_time: number; views_count: number;
  comments_count: number; published_at: string; meta_title: string | null;
  meta_description: string | null; og_image: string | null;
  author: { name: string; avatar: string | null; bio: string | null; };
  category: { name: string; slug: string; } | null;
  tags: { id: number; name: string; slug: string; }[];
  series: { title: string; slug: string; }[];
}

export default function PublicPostPage() {
  const completion = useScrollProgress();
  const { slug } = useParams<{ slug: string }>();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${slug}`);
      return data;
    },
    enabled: !!slug,
  });

  // Track view
  useEffect(() => {
    if (post?.id) {
      api.post(`/posts/${post.id}/track-view`).catch(() => {});
    }
  }, [post?.id]);

  const saveForOffline = async () => {
    if ('caches' in window) {
      const cache = await caches.open('offline-posts');
      await cache.add(window.location.href);
      await cache.add(`/api/posts/${slug}`);
      alert("Post saved for offline reading!");
    }
  };

  // Parse markdown
  const renderedContent = useMemo(() => {
    if (!post?.content) return '';
    return marked.parse(post.content) as string;
  }, [post?.content]);

  // --- Lightbox Trigger ---
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      setActiveImage(img.src);
      setLightboxOpen(true);
    }
  };

  if (isLoading) return <PostSkeleton />;
  if (error || !post) return <PostNotFound />;

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        ogImage={post.og_image || '/default-og-image.png'}
        ogType="article"
      />

      {/* 2. Sticky Progress Bar Container */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
        <div 
          className="h-full bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${completion}%` }}
        />
      </div>

      <article className="container max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-gray-800 pb-6">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                <AvatarImage src={post.author.avatar || undefined} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-900 dark:text-gray-200">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(new Date(post.published_at), 'MMM d, yyyy')}</div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>
                {completion > 95 
                  ? "Finished!" 
                  : `${Math.ceil(post.reading_time * (1 - completion / 100))} min left`}
              </span>
            </div>
            <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.views_count} views</div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {post.category && (
              <Link to={`/category/${post.category.slug}`} className="flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <FolderOpen className="h-3.5 w-3.5" /> {post.category.name}
              </Link>
            )}
            {post.tags.map((tag) => (
              <Link key={tag.id} to={`/tag/${tag.slug}`} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                #{tag.name}
              </Link>
            ))}
          </div>
        </header>

        {/* Post Body with Lightbox logic */}
        <div
          onClick={handleContentClick}
          className="prose prose-lg dark:prose-invert max-w-none mb-12
            prose-img:cursor-zoom-in
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/10
            prose-pre:shadow-2xl prose-pre:border dark:prose-pre:border-gray-800"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Lightbox Component */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: activeImage }]}
          render={{
            buttonPrev: () => null,
            buttonNext: () => null,
          }}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        />

        {/* Footer Sections */}
        {post.author.bio && <AuthorCard author={post.author} />}
        {post.series && post.series.length > 0 && <SeriesCard series={post.series[0]} />}

        {/* Related Posts */}
        <RelatedPosts postSlug={post.slug} />

        {/* Comments */}
        <section className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            Comments <span className="text-gray-400">({post.comments_count})</span>
          </h2>
          <CommentSection postId={post.id} />
        </section>
      </article>

      {/* 👇 Add the Newsletter Popup here */}
      <ScrollTriggeredNewsletter />
    </>
  );
}

// --- Sub-Components ---

function AuthorCard({ author }: { author: any }) {
  return (
    <Card className="mb-12 bg-gray-50 dark:bg-gray-900/50 border-none">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={author.avatar || undefined} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-xl mb-1">{author.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{author.bio}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SeriesCard({ series }: { series: any }) {
  return (
    <Card className="mb-12 border-l-4 border-l-blue-500">
      <CardContent className="pt-6">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Series: {series.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You are reading a post that is part of a sequential series.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/series/${series.slug}`}>Explore the full series</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-400px w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function PostNotFound() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Post not found</h1>
      <Button asChild><Link to="/">Return to Feed</Link></Button>
    </div>
  );
}