import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Series {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  posts_count: number;
}

export default function SeriesList() {
  const { data: series, isLoading, error } = useQuery<Series[]>({
    queryKey: ['series'],
    queryFn: async () => {
      const response = await api.get('/series');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-400px">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load series. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Series</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Curated collections of posts to help you dive deep into topics
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {series?.map((item) => (
          <Link
            key={item.id}
            to={`/series/${item.slug}`}
            className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            {item.cover_image ? (
              <img
                src={item.cover_image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {item.title.charAt(0)}
              </div>
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                {item.title}
              </h2>
              {item.description && (
                <p className="mt-2 text-gray-600 line-clamp-2">{item.description}</p>
              )}
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>{item.posts_count} posts</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {series?.length === 0 && (
        <p className="text-center text-gray-500 py-12">No series found.</p>
      )}
    </div>
  );
}