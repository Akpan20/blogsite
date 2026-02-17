import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Search, BarChart2 } from 'lucide-react';

export default function OtherTools() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Other Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Download className="h-6 w-6 text-green-600" />
            <CardTitle>Export Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Download all your content as Markdown/CSV.</p>
            <Button className="mt-4" variant="outline">Export Now</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Search className="h-6 w-6 text-purple-600" />
            <CardTitle>SEO Checker</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Basic on-page SEO analysis (placeholder).</p>
            <Button className="mt-4" variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <BarChart2 className="h-6 w-6 text-orange-600" />
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Export detailed reports (CSV/PDF).</p>
            <Button className="mt-4" variant="outline">Generate Report</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}