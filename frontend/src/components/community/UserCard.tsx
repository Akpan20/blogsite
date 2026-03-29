import React from 'react';
import { Link } from 'react-router-dom';
import { FollowButton } from './FollowButton';

interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  reputation?: number;
  is_following?: boolean;
  is_online?: boolean;
  badges?: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
}

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  showBio?: boolean;
  showStats?: boolean;
  showBadges?: boolean;
  variant?: 'compact' | 'default' | 'detailed';
  currentUserId?: number;
}

export default function UserCard({
  user,
  showFollowButton = true,
  showBio = true,
  showStats = true,
  showBadges = false,
  variant = 'default',
  currentUserId,
}: UserCardProps) {
  const isCurrentUser = currentUserId === user.id;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
        <Link to={`/profile/${user.id}`} className="relative">
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {user.is_online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/profile/${user.id}`} className="block">
            <h3 className="font-semibold text-gray-900 truncate hover:underline">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user.name}</p>
          </Link>
        </div>

        {showFollowButton && !isCurrentUser && (
          <FollowButton
            userId={user.id}
            initialIsFollowing={user.is_following || false}
            size="sm"
          />
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cover/Header */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-start justify-between -mt-12 mb-4">
            <Link to={`/profile/${user.id}`} className="relative">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
              {user.is_online && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </Link>

            {showFollowButton && !isCurrentUser && (
              <div className="mt-12">
                <FollowButton
                  userId={user.id}
                  initialIsFollowing={user.is_following || false}
                />
              </div>
            )}
          </div>

          {/* User Info */}
          <div>
            <Link to={`/profile/${user.id}`}>
              <h2 className="text-2xl font-bold text-gray-900 hover:underline">
                {user.name}
              </h2>
            </Link>
            <p className="text-gray-600 mb-3">{user.name}</p>

            {showBio && user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}

            {/* Badges */}
            {showBadges && user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {user.badges.map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                    title={badge.name}
                  >
                    <span className="mr-1">{badge.icon}</span>
                    {badge.name}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            {showStats && (
              <div className="flex gap-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {user.posts_count || 0}
                  </p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div className="text-center">
                  <Link
                    to={`/profile/${user.id}/followers`}
                    className="block hover:text-blue-600"
                  >
                    <p className="text-2xl font-bold text-gray-900">
                      {user.followers_count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </Link>
                </div>
                <div className="text-center">
                  <Link
                    to={`/profile/${user.id}/following`}
                    className="block hover:text-blue-600"
                  >
                    <p className="text-2xl font-bold text-gray-900">
                      {user.following_count || 0}
                    </p>
                    <p className="text-sm text-gray-600">Following</p>
                  </Link>
                </div>
                {user.reputation !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {user.reputation}
                    </p>
                    <p className="text-sm text-gray-600">Rep</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <Link to={`/profile/${user.id}`} className="relative shrink-0">
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          {user.is_online && (
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Link to={`/profile/${user.id}`}>
                <h3 className="font-bold text-lg text-gray-900 hover:underline truncate">
                  {user.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-600">{user.name}</p>
            </div>

            {showFollowButton && !isCurrentUser && (
              <FollowButton
                userId={user.id}
                initialIsFollowing={user.is_following || false}
              />
            )}
          </div>

          {showBio && user.bio && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{user.bio}</p>
          )}

          {showBadges && user.badges && user.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {user.badges.slice(0, 3).map((badge) => (
                <span
                  key={badge.id}
                  className="text-lg"
                  title={badge.name}
                >
                  {badge.icon}
                </span>
              ))}
              {user.badges.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{user.badges.length - 3} more
                </span>
              )}
            </div>
          )}

          {showStats && (
            <div className="flex gap-4 text-sm text-gray-600">
              <span>
                <strong className="text-gray-900">{user.posts_count || 0}</strong> posts
              </span>
              <span>
                <strong className="text-gray-900">{user.followers_count || 0}</strong> followers
              </span>
              {user.reputation !== undefined && (
                <span>
                  <strong className="text-yellow-600">{user.reputation}</strong> rep
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}