import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Calendar, BarChart3, Loader2 } from 'lucide-react';
import { useOverview } from '@/hooks/useAnalytics';

export default function OverviewCards() {
  const { data, loading } = useOverview();

  if (loading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="relative">

      {/* Sticky Header */}
      <div className="sticky margin-top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your blog's performance</p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.total_views ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.unique_visitors ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Views This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.views_this_month ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}