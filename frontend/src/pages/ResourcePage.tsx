import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { marked } from 'marked';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, BookOpen, Video, Lightbulb, BarChart3, Share2, Users, Rss, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/seo/SEOHead';
import api from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

marked.setOptions({ breaks: true, gfm: true });

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Video,
  Lightbulb,
  BarChart3,
  Share2,
  Users,
  Rss,
};

const ICON_COLORS: Record<string, string> = {
  Growth:       'text-green-600 dark:text-green-400',
  Monetization: 'text-yellow-600 dark:text-yellow-400',
  Content:      'text-blue-600 dark:text-blue-400',
  Community:    'text-pink-600 dark:text-pink-400',
  Tools:        'text-purple-600 dark:text-purple-400',
};

interface Resource {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  icon: string;
  slug: string;
  created_at: string;
}

export default function ResourcePage() {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme(); // 'light', 'dark', or 'system'

  const { data: resource, isLoading, error } = useQuery<Resource>({
    queryKey: ['resource', slug],
    queryFn: async () => {
      const { data } = await api.get(`/resources/${slug}`);
      return data;
    },
    enabled: !!slug,
  });

  const renderedContent = useMemo(() => {
    if (!resource?.content) return '';
    return marked.parse(resource.content) as string;
  }, [resource?.content]);

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-5 w-24 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-64 w-full mt-6 bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Resource not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          This resource doesn't exist or has been removed.
        </p>
        <Button asChild variant="outline">
          <Link to="/education">← Back to Resources</Link>
        </Button>
      </div>
    );
  }

  const Icon = ICON_MAP[resource.icon] ?? BookOpen;
  const colorClass = ICON_COLORS[resource.category] ?? 'text-blue-600 dark:text-blue-400';

  return (
    <>
      <SEOHead
        title={resource.title}
        description={resource.excerpt}
        ogType="article"
      />

      <article className="container max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/education"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 
                     dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resources
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Icon className={`h-6 w-6 ${colorClass}`} />
            </div>
            <Badge 
              variant="secondary" 
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              {resource.category}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {resource.title}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {resource.excerpt}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Tag className="h-4 w-4" />
            <span>{resource.category}</span>
            <span className="mx-1">·</span>
            <time dateTime={resource.created_at}>
              {format(new Date(resource.created_at), 'MMMM d, yyyy')}
            </time>
          </div>
        </header>

        <hr className="mb-8 border-gray-200 dark:border-gray-700" />

        {/* Main Content – Prose with proper dark mode */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-headings:font-bold
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline
            prose-ul:list-disc prose-ul:pl-6 prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-ol:list-decimal prose-ol:pl-6
            prose-blockquote:border-l-4 prose-blockquote:border-blue-400 dark:prose-blockquote:border-blue-500
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-red-600 dark:prose-code:text-red-400
            prose-code:px-1 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
            prose-pre:shadow-sm prose-pre:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button asChild variant="outline" className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Link to="/education">← Back to all resources</Link>
          </Button>
        </div>
      </article>
    </>
  );
}