import axios from 'axios';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function FollowButton({ authorId, initialIsFollowing }) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`/api/social/follow?followingId=${authorId}`);
      } else {
        await axios.post('/api/social/follow', { followingId: authorId });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading || !session}
      className={`px-4 py-2 rounded ${
        isFollowing
          ? 'bg-gray-200 hover:bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
