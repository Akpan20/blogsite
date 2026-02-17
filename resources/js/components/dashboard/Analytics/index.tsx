import OverviewCards from './OverviewCards';
import ViewsTrendChart from './ViewsTrendChart';
import TopPostsTable from './TopPostsTable';

export default function Analytics() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Overview</h1>
      
      <OverviewCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ViewsTrendChart />
        <TopPostsTable />
      </div>
    </div>
  );
}