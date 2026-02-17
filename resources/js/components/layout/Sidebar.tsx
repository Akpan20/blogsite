import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import TagCloud from '@/components/content/TagCloud';
import SuggestedUsers from '@/components/community/SuggestedUsers';
import NewsletterSubscribe from '@/components/newsletter/NewsletterSubscribe';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  posts_count: number;
}

interface TrendingPost {
  id: number;
  title: string;
  slug: string;
  views_count: number;
  featured_image?: string;
  reading_time?: number;
}

interface Series {
  id: number;
  title: string;
  slug: string;
  posts_count: number;
  is_featured: boolean;
}

interface SidebarProps {
  variant?: 'default' | 'blog' | 'dashboard';
  sticky?: boolean;
}

export default function Sidebar({ variant = 'default', sticky = true }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [featuredSeries, setFeaturedSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, trendingRes, seriesRes] = await Promise.all([
        api.get('/categories', { params: { with_posts_count: true } }),
        api.get('/posts/trending', { params: { limit: 5 } }),
        api.get('/series', { params: { featured: true, limit: 3 } }),
      ]);

      setCategories(categoriesRes.data.slice(0, 8));
      setTrendingPosts(trendingRes.data.data || trendingRes.data);
      setFeaturedSeries(seriesRes.data.data || seriesRes.data);
    } catch (error) {
      console.error('Failed to fetch sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dashboard variant
  if (variant === 'dashboard') {
    return (
      <aside className={`w-80 bg-white border-l border-gray-200 ${sticky ? 'sticky top-0 h-screen overflow-y-auto' : ''}`}>
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-semibold text-gray-900">{user?.posts_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Followers</span>
                <span className="font-semibold text-gray-900">{user?.followers_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reputation</span>
                <span className="font-semibold text-yellow-600">{user?.reputation_points || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/content"
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </Link>
              
              <Link
                to="/analytics"
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Analytics
              </Link>
            </div>
          </div>

          {/* Tips & Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tips & Resources</h3>
            <div className="space-y-3 text-sm">
              <Link to="/education" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📚</span>
                  <div>
                    <div className="font-medium text-purple-900">Creator Education</div>
                    <div className="text-xs text-purple-700">Learn best practices</div>
                  </div>
                </div>
              </Link>

              <Link to="/support" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💬</span>
                  <div>
                    <div className="font-medium text-green-900">Get Support</div>
                    <div className="text-xs text-green-700">We're here to help</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Blog/Default variant
  return (
    <aside className={`w-80 space-y-6 ${sticky ? 'sticky top-6' : ''}`}>
      {/* Search Widget */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Search</h3>
        <Link
          to="/search"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 transition text-gray-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search posts...</span>
        </Link>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Categories</h3>
          <Link to="/categories" className="text-sm text-blue-600 hover:text-blue-800">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-8 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {category.icon && <span className="text-lg">{category.icon}</span>}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
                    {category.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {category.posts_count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trending Posts */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">Trending Now</h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {trendingPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/posts/${post.slug}`}
                className="flex gap-3 group"
              >
                <div className="shrink-0 w-8 h-8 bg-linear-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views_count.toLocaleString()}
                    </span>
                    {post.reading_time && (
                      <span>{post.reading_time} min read</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Series */}
      {featuredSeries.length > 0 && (
        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg shadow p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-bold text-purple-900">Featured Series</h3>
          </div>

          <div className="space-y-3">
            {featuredSeries.map((series) => (
              <Link
                key={series.id}
                to={`/series/${series.slug}`}
                className="block p-3 bg-white rounded-lg hover:shadow-md transition"
              >
                <h4 className="font-semibold text-purple-900 mb-1 line-clamp-2">
                  {series.title}
                </h4>
                <p className="text-xs text-purple-700">
                  {series.posts_count} parts
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tag Cloud */}
      <TagCloud
        limit={30}
        minSize={12}
        maxSize={24}
        showCount={false}
        variant="gradient"
      />

      {/* Newsletter Subscribe */}
      {!user && (
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1">Stay Updated</h3>
            <p className="text-sm text-blue-100">
              Get the latest posts delivered to your inbox
            </p>
          </div>
          <NewsletterSubscribe variant="sidebar" />
        </div>
      )}

      {/* Suggested Users */}
      {user && (
        <SuggestedUsers
          currentUserId={user.id}
          variant="sidebar"
          limit={5}
          showReason={true}
        />
      )}

      {/* Premium CTA */}
      {user && !user.is_premium && (
        <div className="bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
          <div className="text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-lg font-bold mb-2">Go Premium</h3>
            <p className="text-sm text-yellow-50 mb-4">
              Unlock exclusive content, badges, and remove ads
            </p>
            <Link
              to="/subscription/plans"
              className="inline-block px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-yellow-50 transition"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* About / Info */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
        <p className="text-sm text-gray-600 mb-4">
          A community-driven platform for sharing knowledge, stories, and expertise.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link to="/about" className="text-blue-600 hover:text-blue-800">About</Link>
          <span className="text-gray-300">•</span>
          <Link to="/guidelines" className="text-blue-600 hover:text-blue-800">Guidelines</Link>
          <span className="text-gray-300">•</span>
          <Link to="/privacy" className="text-blue-600 hover:text-blue-800">Privacy</Link>
          <span className="text-gray-300">•</span>
          <Link to="/terms" className="text-blue-600 hover:text-blue-800">Terms</Link>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Connect</h3>
        <div className="flex gap-3">
          <a
            href="https://twitter.com/yourblog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>
          <a
            href="https://github.com/yourblog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/company/yourblog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-200 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="/rss"
            className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center hover:bg-orange-200 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}