import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from './UserCard';

interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  mutual_followers_count?: number;
  is_following?: boolean;
  is_online?: boolean;
  reason?: string; // Why this user is suggested
}

interface SuggestedUsersProps {
  currentUserId?: number;
  limit?: number;
  showReason?: boolean;
  variant?: 'sidebar' | 'page';
}

export default function SuggestedUsers({
  currentUserId,
  limit = 5,
  showReason = true,
  variant = 'sidebar',
}: SuggestedUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSuggestedUsers();
  }, [limit, refreshKey]);

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/users/suggestions', {
        params: { limit },
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = (userId: number, isFollowing: boolean) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, is_following: isFollowing } : user
      )
    );

    // Remove from suggestions after following (optional)
    if (isFollowing && variant === 'sidebar') {
      setTimeout(() => {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      }, 500);
    }
  };

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const dismissUser = async (userId: number) => {
    try {
      await axios.post(`/api/users/${userId}/dismiss-suggestion`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
    }
  };

  const getReasonIcon = (reason?: string) => {
    if (!reason) return null;

    if (reason.includes('mutual')) {
      return (
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }

    if (reason.includes('popular') || reason.includes('trending')) {
      return (
        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }

    if (reason.includes('similar') || reason.includes('interests')) {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${variant === 'page' ? 'p-6' : 'p-4'}`}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow ${variant === 'page' ? 'p-6' : 'p-4'}`}>
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-sm">No suggestions at the moment</p>
          <button
            onClick={refresh}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh suggestions
          </button>
        </div>
      </div>
    );
  }

  // Sidebar variant - compact view
  if (variant === 'sidebar') {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Who to follow</h3>
          <button
            onClick={refresh}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Refresh suggestions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="relative group">
              <UserCard
                user={user}
                variant="compact"
                showFollowButton={true}
                showBio={false}
                showStats={false}
                currentUserId={currentUserId}
              />

              {showReason && user.reason && (
                <div className="flex items-center gap-1 mt-1 ml-15 text-xs text-gray-500">
                  {getReasonIcon(user.reason)}
                  <span>{user.reason}</span>
                </div>
              )}

              {/* Dismiss button on hover */}
              <button
                onClick={() => dismissUser(user.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600"
                title="Don't show this suggestion"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.href = '/discover'}
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Show more
        </button>
      </div>
    );
  }

  // Page variant - full view
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Discover People</h2>
              <p className="text-gray-600 mt-1">Find interesting people to follow</p>
            </div>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="relative">
                <UserCard
                  user={user}
                  variant="default"
                  showFollowButton={true}
                  showBio={true}
                  showStats={true}
                  currentUserId={currentUserId}
                />

                {showReason && user.reason && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full shadow-sm text-xs text-gray-600">
                      {getReasonIcon(user.reason)}
                      <span>{user.reason}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Popular</h3>
          <p className="text-sm text-gray-600 mt-1">Most followed users</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-md transition">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Trending</h3>
          <p className="text-sm text-gray-600 mt-1">Active right now</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center cursor-pointer hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Similar</h3>
          <p className="text-sm text-gray-600 mt-1">Based on your interests</p>
        </div>
      </div>
    </div>
  );
}