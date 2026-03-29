import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import TagCloud from '@/components/content/TagCloud';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

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
  const { user, logout } = useAuth(); // 👈 get logout
  const isAdmin = user?.role === 'admin' || user?.is_admin;

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

  const handleLogout = async () => {
    await logout();
  };

  // ── Dashboard variant ────────────────────────────────────────────────────────
  if (variant === 'dashboard') {
    return (
      <aside
        className={`w-full space-y-6 ${
          sticky ? 'sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto' : ''
        }`}
      >
        <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">

          {/* 👇 Added: Back to Home Link */}
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                />
              </svg>
              Back to Home
            </Link>
            <hr className="mt-4 border-gray-100 dark:border-gray-800" />
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/content"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-800 dark:text-gray-200 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Analytics
              </Link>
            </div>
          </div>

          {/* 👇 Admin Tools (only for admins) */}
          {isAdmin && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Admin Tools
              </h3>
              <div className="space-y-2">
                <Link
                  to="/admin/categories"
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition text-indigo-700 dark:text-indigo-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Manage Categories
                </Link>
                <Link
                  to="/admin/featured-posts"
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition text-amber-700 dark:text-amber-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Featured Posts
                </Link>
                <Link
                  to="/admin/revenue"
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition text-emerald-700 dark:text-emerald-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Revenue Analytics
                </Link>
              </div>
            </div>
          )}

          {/* Tips & Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Tips & Resources
            </h3>
            <div className="space-y-3 text-sm">
              <Link
                to="/education"
                className="block p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">📚</span>
                  <div>
                    <div className="font-medium text-purple-900 dark:text-purple-200">Creator Education</div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                      Learn best practices
                    </div>
                  </div>
                </div>
              </Link>
              <Link
                to="/support"
                className="block p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-200">Get Support</div>
                    <div className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                      We're here to help
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ── Blog / Default variant ───────────────────────────────────────────────────
  return (
    <aside className={`w-80 space-y-6 ${sticky ? 'sticky top-6' : ''}`}>
      {/* ... (keep your existing blog/default sidebar widgets) ... */}
    </aside>
  );
}