import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface FollowButtonProps {
  userId: number;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialIsFollowing,
  onFollowChange,
  variant = 'default',
  size = 'default',
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFollow = async () => {
    try {
      setIsLoading(true);
      
      const response = await api.post(`/users/${userId}/toggle-follow`);
      
      setIsFollowing(response.data.is_following);
      
      if (onFollowChange) {
        onFollowChange(response.data.is_following);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleToggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
};