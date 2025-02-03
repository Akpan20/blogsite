import { Card } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Dashboard',
  description: 'Detailed analytics and insights'
};

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Page Views</h2>
            {/* Add your analytics components here */}
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">User Engagement</h2>
            {/* Add engagement metrics here */}
          </div>
        </Card>
      </div>
    </div>
  );
}
