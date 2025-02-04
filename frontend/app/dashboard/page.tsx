'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/src/components/ui/card';
import Dashboard from '@/src/components/analytics/Dashboard';

// Client-side only import for Recharts
const DashboardMetrics = dynamic(
  () => import('@/src/components/analytics/Dashboard'),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
            <DashboardMetrics />
          </div>
        </Card>
      </div>
    </>
  );
}