import { Card } from '@/components/ui/card';
import { Metadata } from 'next';
import DashboardMetrics from '@/components/analytics/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Blog Platform',
  description: 'View your blog analytics and metrics'
};

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
            <DashboardMetrics />
          </div>
        </Card>
      </div>
    </div>
  );
}