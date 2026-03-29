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
  is_following?: boolean;
  is_online?: boolean;
}

interface FollowersListProps {
  userId: number;
  username: string;
  type: 'followers' | 'following';
  currentUserId?: number;
}

export default function FollowersList({
  userId,
  username,
  type,
  currentUserId,
}: FollowersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [userId, type, page]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim()) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint =
        type === 'followers'
          ? `/api/users/${userId}/followers`
          : `/api/users/${userId}/following`;

      const { data } = await axios.get(endpoint, {
        params: { page, per_page: 20 },
      });

      if (page === 1) {
        setUsers(data.data);
      } else {
        setUsers((prev) => [...prev, ...data.data]);
      }

      setTotalCount(data.total);
      setHasMore(data.current_page < data.last_page);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleFollowChange = (targetUserId: number, isFollowing: boolean) => {
    // Update the user's following status in the list
    setUsers((prev) =>
      prev.map((user) =>
        user.id === targetUserId ? { ...user, is_following: isFollowing } : user
      )
    );

    // If we're viewing followers and the current user unfollows someone,
    // we might want to refresh the list or handle it differently
    if (type === 'followers' && !isFollowing && targetUserId === userId) {
      // Optionally remove from list or mark as not following back
    }
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
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {type === 'followers' ? 'Followers' : 'Following'}
              <span className="ml-2 text-gray-500 font-normal">
                ({totalCount})
              </span>
            </h2>
          </div>

          {/* Search */}
          {users.length > 0 && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${type}...`}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchQuery ? (
              <>
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-lg">No users found</p>
                <p className="text-sm mt-2">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-lg">
                  {type === 'followers'
                    ? `@${username} has no followers yet`
                    : `@${username} isn't following anyone yet`}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4">
                  <UserCard
                    user={user}
                    variant="compact"
                    showFollowButton={true}
                    showBio={false}
                    showStats={false}
                    currentUserId={currentUserId}
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
            {!searchQuery && hasMore && (
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
          </>
        )}
      </div>

      {/* Mutual Follows Notice */}
      {type === 'followers' && filteredUsers.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">
                Mutual Followers
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Users who follow {username} and {username} follows back are
                marked with a mutual badge in their profiles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}