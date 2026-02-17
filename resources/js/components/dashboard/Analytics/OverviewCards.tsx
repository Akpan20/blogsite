import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Calendar } from 'lucide-react';
import { useOverview } from '@/hooks/useAnalytics';

export default function OverviewCards() {
  const { data, isLoading } = useOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="pt-6">Loading...</CardContent></Card>
        <Card><CardContent className="pt-6">Loading...</CardContent></Card>
        <Card><CardContent className="pt-6">Loading...</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(data?.total_views ?? 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(data?.unique_visitors ?? 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Views This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(data?.views_this_month ?? 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}