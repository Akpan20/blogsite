import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText, Users, Eye, TrendingUp, DollarSign, MessageSquare, Loader2, LayoutDashboard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  total_posts: number;
  total_views: number;
  total_subscribers: number;
  total_revenue: number;
  posts_change: string;
  views_change: string;
  subscribers_change: string;
  revenue_change: string;
}

interface RecentPost {
  id: number;
  title: string;
  slug: string;
  views_count: number;
  comments_count: number;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/overview');
      return response.data;
    },
  });

  const { data: recentPosts, isLoading: postsLoading } = useQuery<RecentPost[]>({
    queryKey: ['recent-posts'],
    queryFn: async () => {
      const response = await api.get('/posts?limit=4&sort=created_at&order=desc');
      return response.data.data || response.data;
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diffInDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const statsData = [
    { title: 'Total Posts',   value: stats?.total_posts?.toLocaleString() ?? '0',                        change: stats?.posts_change ?? '+0%',       icon: FileText,   color: 'text-blue-600',   bgColor: 'bg-blue-100'   },
    { title: 'Total Views',   value: stats?.total_views?.toLocaleString() ?? '0',                        change: stats?.views_change ?? '+0%',       icon: Eye,        color: 'text-green-600',  bgColor: 'bg-green-100'  },
    { title: 'Subscribers',   value: stats?.total_subscribers?.toLocaleString() ?? '0',                  change: stats?.subscribers_change ?? '+0%', icon: Users,      color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { title: 'Revenue',       value: stats?.total_revenue ? `₦${stats.total_revenue.toLocaleString()}` : '₦0', change: stats?.revenue_change ?? '+0%', icon: DollarSign, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  ];

  if (statsLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <LayoutDashboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Here's what's happening with your blog today</p>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="space-y-8 pb-12">

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.change.startsWith('+');
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <TrendingUp className="h-3 w-3" />
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Posts</CardTitle>
            <button
              onClick={() => navigate('/content')}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View all →
            </button>
          </CardHeader>
          <CardContent>
            {!recentPosts || recentPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No posts yet</p>
                <p className="text-sm mt-1">Create your first post to get started.</p>
                <button
                  onClick={() => navigate('/content/new')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Create Post
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/content/${post.slug}`)}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0 mr-6">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{post.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formatTimeAgo(post.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {post.views_count?.toLocaleString() ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        {post.comments_count ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}