import { Card } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Posts | Dashboard',
  description: 'Manage your blog posts'
};

export default function PostsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Posts Management</h1>
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            {/* Add PostList component here */}
          </div>
        </Card>
      </div>
    </div>
  );
}