import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Blog Platform',
  description: 'View your blog analytics and metrics'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar would go here */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}