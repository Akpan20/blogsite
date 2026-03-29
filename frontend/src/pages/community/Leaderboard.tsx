import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FollowButton } from '@/components/community/FollowButton';

interface LeaderboardUser {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
  reputation: number;
  badges_count: number;
  followers_count: number;
  posts_count: number;
  is_following?: boolean;
  rank: number;
  rank_change?: number; // +5, -2, 0, etc.
  badges?: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
}

type LeaderboardType = 'reputation' | 'badges' | 'followers' | 'posts';
type TimeRange = 'all_time' | 'month' | 'week';

export default function Leaderboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<LeaderboardType>('reputation');
  const [timeRange, setTimeRange] = useState<TimeRange>('all_time');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  // Update current user ID when auth state changes
  const currentUserId = user?.id || null;

  useEffect(() => {
    fetchLeaderboard();
  }, [type, timeRange]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/leaderboard', {
        params: { type, time_range: timeRange, limit: 50 },
      });

      // Handle different possible response structures
      const leaderboardUsers = data.users || data.data || data || [];
      setUsers(Array.isArray(leaderboardUsers) ? leaderboardUsers : []);
      setCurrentUserRank(data.current_user_rank || null);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-10 h-10 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-10 h-10 bg-linear-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          {rank}
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-10 h-10 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          {rank}
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold">
        {rank}
      </div>
    );
  };

  const getRankChangeIndicator = (change?: number) => {
    if (!change || change === 0) return null;

    if (change > 0) {
      return (
        <span className="inline-flex items-center text-green-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {change}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center text-red-600 text-sm font-medium">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {Math.abs(change)}
      </span>
    );
  };

  const getTypeLabel = (t: LeaderboardType) => {
    switch (t) {
      case 'reputation': return 'Reputation Points';
      case 'badges': return 'Total Badges';
      case 'followers': return 'Followers';
      case 'posts': return 'Posts Published';
    }
  };

  const getTypeValue = (user: LeaderboardUser) => {
    switch (type) {
      case 'reputation': return user.reputation;
      case 'badges': return user.badges_count;
      case 'followers': return user.followers_count;
      case 'posts': return user.posts_count;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-6">
        <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-blue-100">See who's leading the community!</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rank by
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['reputation', 'badges', 'followers', 'posts'] as LeaderboardType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    type === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['all_time', 'month', 'week'] as TimeRange[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    timeRange === t
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t === 'all_time' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current User Position */}
      {currentUserRank && currentUserRank > 10 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-blue-900">Your Current Rank</p>
              <p className="text-sm text-blue-700">
                You're ranked #{currentUserRank} in {getTypeLabel(type).toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {getTypeLabel(type)}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition ${
                      user.id === currentUserId ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getRankBadge(user.rank)}
                        {getRankChangeIndicator(user.rank_change)}
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link to={`/profile/${user.id}`}>
                          <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </Link>
                        <div>
                          <Link to={`/profile/${user.id}`}>
                            <p className="font-semibold text-gray-900 hover:underline">
                              {user.name}
                            </p>
                          </Link>
                          <p className="text-sm text-gray-500">{user.name}</p>

                          {/* Show badges for badge leaderboard */}
                          {type === 'badges' && user.badges && user.badges.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {user.badges.slice(0, 5).map((badge) => (
                                <span key={badge.id} className="text-lg" title={badge.name}>
                                  {badge.icon}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-2xl font-bold text-gray-900">
                        {getTypeValue(user).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.posts_count} posts · {user.followers_count} followers
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {user.id !== currentUserId && (
                        <FollowButton
                          userId={user.id}
                          initialIsFollowing={user.is_following || false}
                        />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">
                    <p className="text-lg">No data available for this time period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users && users.length > 0 && users[0] ? getTypeValue(users[0]).toLocaleString() : '—'}
              </p>
              <p className="text-sm text-gray-600">Top Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users ? users.length : 0}</p>
              <p className="text-sm text-gray-600">Total Ranked</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {currentUserRank ? `#${currentUserRank}` : '—'}
              </p>
              <p className="text-sm text-gray-600">Your Rank</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}