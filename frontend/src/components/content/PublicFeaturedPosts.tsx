import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
}

interface Props {
  limit?: number;
}

export default function PublicFeaturedPosts({ limit = 3 }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/featured-posts?limit=${limit}`);
            setPosts(response.data.data || response.data);
        } catch (err) {
            console.error('Failed to fetch featured posts:', err);
            setError('Could not load featured posts.');
        } finally {
            setLoading(false);
        }
        };

    fetchFeatured();
  }, [limit]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: limit }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!posts.length) {
    return <p className="text-gray-500 text-center">No featured posts yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow">
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          )}
          <CardContent className="p-4">
            {/* FIXED: curly braces around template literal */}
            <Link to={`/content/${post.slug}`} className="block">
              <h3 className="text-lg font-semibold hover:text-blue-600 transition line-clamp-2">
                {post.title}
              </h3>
            </Link>
            {post.excerpt && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {post.excerpt}
              </p>
            )}
            {post.category && (
              <span
                className="inline-block mt-3 px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: `${post.category.color}20`,
                  color: post.category.color,
                }}
              >
                {post.category.name}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}