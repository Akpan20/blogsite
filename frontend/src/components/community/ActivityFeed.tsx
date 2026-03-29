import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
}

interface Activity {
  id: number;
  user_id: number;
  type: 'post' | 'comment' | 'follow' | 'badge' | 'like';
  description: string;
  subject_id?: number;
  subject_type?: string;
  created_at: string;
  user: User;
  metadata?: {
    post_title?: string;
    post_slug?: string;
    followed_user?: User;
    badge_name?: string;
    badge_icon?: string;
  };
}

interface ActivityFeedProps {
  type?: 'personal' | 'global';
  userId?: number;
  limit?: number;
}

export default function ActivityFeed({ type = 'personal', userId, limit = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [type, userId, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'personal' 
        ? '/api/activities/feed'
        : userId 
        ? `/api/users/${userId}/activities`
        : '/api/activities/global';
      
      const { data } = await axios.get(endpoint, {
        params: { page, per_page: limit }
      });
      
      if (page === 1) {
        setActivities(data.data);
      } else {
        setActivities(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.current_page < data.last_page);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'post':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'badge':
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        );
      case 'like':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const renderActivityContent = (activity: Activity) => {
    const metadata = activity.metadata || {};
    
    switch (activity.type) {
      case 'post':
        return (
          <div>
            <Link to={`/profile/${activity.user.id}`} className="font-semibold hover:underline">
              {activity.user.name}
            </Link>
            <span className="text-gray-600"> published a new post: </span>
            {metadata.post_slug && metadata.post_title ? (
              <Link to={`/content/${metadata.post_slug}`} className="text-blue-600 hover:underline font-medium">
                {metadata.post_title}
              </Link>
            ) : (
              <span className="font-medium">{activity.description}</span>
            )}
          </div>
        );
      
      case 'comment':
        return (
          <div>
            <Link to={`/profile/${activity.user.id}`} className="font-semibold hover:underline">
              {activity.user.name}
            </Link>
            <span className="text-gray-600"> commented on </span>
            {metadata.post_slug ? (
              <Link to={`/content/${metadata.post_slug}`} className="text-blue-600 hover:underline">
                a post
              </Link>
            ) : (
              <span>a post</span>
            )}
          </div>
        );
      
      case 'follow':
        return (
          <div>
            <Link to={`/profile/${activity.user.id}`} className="font-semibold hover:underline">
              {activity.user.name}
            </Link>
            <span className="text-gray-600"> started following </span>
            {metadata.followed_user ? (
              <Link to={`/profile/${metadata.followed_user.id}`} className="font-semibold hover:underline">
                {metadata.followed_user.name}
              </Link>
            ) : (
              <span>someone</span>
            )}
          </div>
        );
      
      case 'badge':
        return (
          <div>
            <Link to={`/profile/${activity.user.id}`} className="font-semibold hover:underline">
              {activity.user.name}
            </Link>
            <span className="text-gray-600"> earned the </span>
            <span className="font-semibold text-yellow-600">
              {metadata.badge_icon && <span className="mr-1">{metadata.badge_icon}</span>}
              {metadata.badge_name || 'badge'}
            </span>
            <span className="text-gray-600"> badge</span>
          </div>
        );
      
      case 'like':
        return (
          <div>
            <Link to={`/profile/${activity.user.id}`} className="font-semibold hover:underline">
              {activity.user.name}
            </Link>
            <span className="text-gray-600"> liked </span>
            {metadata.post_slug ? (
              <Link to={`/content/${metadata.post_slug}`} className="text-blue-600 hover:underline">
                a post
              </Link>
            ) : (
              <span>a post</span>
            )}
          </div>
        );
      
      default:
        return <p className="text-gray-700">{activity.description}</p>;
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {type === 'personal' ? 'Your Feed' : userId ? 'Activity' : 'Global Activity'}
          </h2>
        </div>

        {activities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="text-lg">No activity yet</p>
            <p className="text-sm mt-2">
              {type === 'personal'
                ? 'Start following users to see their activities here!'
                : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex gap-3">
                  <Link to={`/profile/${activity.user.id}`}>
                    <img
                      src={activity.user.avatar_url || `https://ui-avatars.com/api/?name=${activity.user.name}`}
                      alt={activity.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity)}
                      <div className="flex-1">
                        <div className="text-sm">
                          {renderActivityContent(activity)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && activities.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}