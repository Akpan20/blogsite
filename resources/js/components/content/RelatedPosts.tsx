import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  reading_time?: number;
  published_at: string;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  user: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}

interface RelatedPostsProps {
  currentPostId: number;
  limit?: number;
  variant?: 'grid' | 'list' | 'compact';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
  showImage?: boolean;
}

export default function RelatedPosts({
  currentPostId,
  limit = 3,
  variant = 'grid',
  showExcerpt = true,
  showAuthor = false,
  showCategory = true,
  showImage = true,
}: RelatedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedPosts();
  }, [currentPostId, limit]);

  const fetchRelatedPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/posts/${currentPostId}/related`, {
        params: { limit },
      });
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch related posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  // Compact variant - minimal design
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Related Posts</h3>
        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.slug}`}
              className="block p-2 hover:bg-gray-50 rounded transition"
            >
              <h4 className="font-medium text-gray-900 text-sm hover:text-blue-600 line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {post.reading_time && <span>{post.reading_time} min read</span>}
                <span>{formatDate(post.published_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">You Might Also Like</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.slug}`}
              className="block p-6 hover:bg-gray-50 transition"
            >
              <div className="flex gap-4">
                {/* Featured Image */}
                {showImage && post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  {/* Category */}
                  {showCategory && post.category && (
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium mb-2"
                      style={{
                        backgroundColor: `${post.category.color}20`,
                        color: post.category.color,
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}

                  {/* Title */}
                  <h4 className="font-bold text-gray-900 text-lg mb-2 hover:text-blue-600 line-clamp-2">
                    {post.title}
                  </h4>

                  {/* Excerpt */}
                  {showExcerpt && post.excerpt && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {showAuthor && (
                      <div className="flex items-center gap-2">
                        {post.user.avatar_url && (
                          <img
                            src={post.user.avatar_url}
                            alt={post.user.name}
                            className="w-5 h-5 rounded-full"
                          />
                        )}
                        <span>{post.user.name}</span>
                      </div>
                    )}
                    <span>{formatDate(post.published_at)}</span>
                    {post.reading_time && <span>{post.reading_time} min read</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Related Posts</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.slug}`}
            className="group"
          >
            {/* Featured Image */}
            {showImage && post.featured_image && (
              <div className="relative overflow-hidden rounded-lg mb-3 aspect-video">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Reading Time Badge */}
                {post.reading_time && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                    {post.reading_time} min
                  </div>
                )}
              </div>
            )}

            {/* Category */}
            {showCategory && post.category && (
              <span
                className="inline-block px-2 py-1 rounded text-xs font-medium mb-2"
                style={{
                  backgroundColor: `${post.category.color}20`,
                  color: post.category.color,
                }}
              >
                {post.category.name}
              </span>
            )}

            {/* Title */}
            <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
              {post.title}
            </h4>

            {/* Excerpt */}
            {showExcerpt && post.excerpt && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              {showAuthor && (
                <div className="flex items-center gap-2">
                  {post.user.avatar_url && (
                    <img
                      src={post.user.avatar_url}
                      alt={post.user.name}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="truncate">{post.user.name}</span>
                </div>
              )}
              <span>{formatDate(post.published_at)}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <Link
          to="/posts"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Posts →
        </Link>
      </div>
    </div>
  );
}