import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Video, Lightbulb, BarChart3, Share2, Users, Rss, Search } from 'lucide-react';
import api from '@/lib/api';

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Video, Lightbulb, BarChart3, Share2, Users, Rss,
};

const ICON_COLORS: Record<string, string> = {
  Growth:       'text-green-600',
  Monetization: 'text-yellow-600',
  Content:      'text-blue-600',
  Community:    'text-pink-600',
  Tools:        'text-purple-600',
};

interface Resource {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  icon: string;
  slug: string;
}

export default function CreatorEducation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ['creator-resources'],
    queryFn: async () => {
      const { data } = await api.get('/resources');
      return data;
    },
  });

  const filteredResources = resources.filter(
    (res) =>
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeStatus('loading');
    try {
      await api.post('/newsletter/subscribe', { email, source: 'sidebar' });
      setSubscribeStatus('success');
      setEmail('');
    } catch {
      setSubscribeStatus('error');
    }
  };

  return (
    <div className="relative">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Creator Education</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resources to help you build a successful blog</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="container pb-12 space-y-10">

        {/* Resource Cards */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-3/4 mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-8 w-28 mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const Icon = ICON_MAP[resource.icon] ?? BookOpen;
              const colorClass = ICON_COLORS[resource.category] ?? 'text-blue-600';
              return (
                <Card key={resource.id} className="hover:shadow-md transition-shadow flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-8 w-8 shrink-0 ${colorClass}`} />
                      <CardTitle className="text-xl leading-tight">{resource.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <CardDescription className="text-base flex-1">
                      {resource.excerpt}
                    </CardDescription>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                        {resource.category}
                      </span>
                      <Button
                        variant="link"
                        className="px-0"
                        onClick={() => navigate(`/resources/${resource.slug}`)}
                      >
                        Start Learning →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredResources.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No resources found matching "{searchQuery}"
          </div>
        )}

        {/* Newsletter CTA */}
        <Card className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to take your blog to the next level?</CardTitle>
            <CardDescription className="text-lg">
              Join our weekly creator newsletter for exclusive tips, case studies, and early access to new features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscribeStatus === 'success' ? (
              <p className="text-green-600 font-medium">
                🎉 You're subscribed! Check your email to confirm.
              </p>
            ) : (
              <form onSubmit={handleSubscribe}>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={subscribeStatus === 'loading'}
                  />
                  <Button type="submit" disabled={subscribeStatus === 'loading'}>
                    {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>
                {subscribeStatus === 'error' && (
                  <p className="text-red-500 text-sm mt-2">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
            <p className="text-sm text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}