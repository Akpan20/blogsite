import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOverview } from '@/hooks/useAnalytics';

export default function TopPostsTable() {
  const { data, isLoading } = useOverview();

  if (isLoading) return <div>Loading top posts...</div>;
  if (!data?.top_posts) return <div>No data available</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Posts by Views</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post Title</TableHead>
              <TableHead className="text-right">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.top_posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                  No views recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              data.top_posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="text-right">{post.views_count.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}