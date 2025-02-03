import axios from 'axios';
import { useState } from 'react';

export default function RecommendedPosts() {
    const [posts, setPosts] = useState({ followedPosts: [], recommendedPosts: [] });
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      fetchRecommendations();
    }, []);
  
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get('/api/recommendations/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (loading) {
      return <div>Loading recommendations...</div>;
    }
  
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">From People You Follow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.followedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
  
        <div>
          <h3 className="text-xl font-semibold mb-4">Recommended for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.recommendedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    );
}