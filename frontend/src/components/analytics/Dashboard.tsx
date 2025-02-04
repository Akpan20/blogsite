import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Users, FileText, Eye, Share2, MessageSquare, TrendingUp } from 'lucide-react';
import { analyticService } from '@/src/services/analyticService';
import { DashboardStats, PageViewData, EngagementMetric } from '@/src/services/analyticService';

const DashboardMetrics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [engagement, setEngagement] = useState<{
    engagement: EngagementMetric[];
    engagementRate: number;
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [statsData, pageViewsData, engagementData] = await Promise.all([
          analyticService.getDashboardStats(),
          analyticService.getPageViews(),
          analyticService.getEngagementMetrics(),
        ]);

        // Transform page views data for the chart
        const formattedPageViews = pageViewsData.map(pv => ({
          date: new Date(pv.createdAt).toLocaleDateString(),
          views: pv._count.id
        }));

        setStats(statsData);
        setPageViews(formattedPageViews);
        setEngagement(engagementData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total Users</p>
                <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total Posts</p>
                <h3 className="text-2xl font-bold">{stats?.totalPosts || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Total Comments</p>
                <h3 className="text-2xl font-bold">{stats?.totalComments || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium">Engagement Rate</p>
                <h3 className="text-2xl font-bold">{engagement?.engagementRate.toFixed(1) || 0}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pageViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagement?.engagement.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {item.type === 'view' && <Eye className="h-5 w-5 text-gray-500" />}
                    {item.type === 'share' && <Share2 className="h-5 w-5 text-gray-500" />}
                    {item.type === 'comment' && <MessageSquare className="h-5 w-5 text-gray-500" />}
                    <span className="ml-2 capitalize">{item.type}</span>
                  </div>
                  <span className="font-medium">{item._count.id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;