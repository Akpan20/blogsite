import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  posts_count: number;
}

export default function CategoryList() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
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
        <p className="text-red-600">Failed to load categories. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Categories</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore topics and find content that interests you
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <Link
            key={category.id}
            to={`/categories/${category.slug}`}
            className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
              {category.name}
            </h2>
            {category.description && (
              <p className="mt-2 text-gray-600 line-clamp-2">{category.description}</p>
            )}
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span>{category.posts_count} posts</span>
            </div>
          </Link>
        ))}
      </div>

      {categories?.length === 0 && (
        <p className="text-center text-gray-500 py-12">No categories found.</p>
      )}
    </div>
  );
}