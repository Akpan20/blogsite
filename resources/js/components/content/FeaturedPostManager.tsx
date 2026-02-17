import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  featured_order: number;
  is_featured: boolean;
  views_count: number;
  likes_count: number;
  category?: {
    id: number;
    name: string;
    color: string;
  };
}

export default function FeaturedPostManager() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [availablePosts, setAvailablePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      // Fetch featured posts
      const { data: featured } = await axios.get('/api/posts', {
        params: { 
          status: 'published', 
          is_featured: true,
          sort_by: 'featured_order',
          sort_order: 'asc',
        },
      });

      // Fetch available posts (published, not featured)
      const { data: available } = await axios.get('/api/posts', {
        params: { 
          status: 'published', 
          is_featured: false,
          per_page: 50,
        },
      });

      setFeaturedPosts(featured.data || featured);
      setAvailablePosts(available.data || available);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingIndex === null || draggingIndex === index) return;

    const newPosts = [...featuredPosts];
    const draggedPost = newPosts[draggingIndex];

    // Remove from old position
    newPosts.splice(draggingIndex, 1);
    
    // Insert at new position
    newPosts.splice(index, 0, draggedPost);

    setFeaturedPosts(newPosts);
    setDraggingIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggingIndex(null);

    // Update featured_order for all posts
    try {
      const updates = featuredPosts.map((post, index) => ({
        id: post.id,
        featured_order: index + 1,
      }));

      await axios.post('/api/posts/featured/reorder', { posts: updates });
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to save new order');
    }
  };

  const addToFeatured = async (post: Post) => {
    try {
      await axios.patch(`/api/posts/${post.id}`, {
        is_featured: true,
        featured_order: featuredPosts.length + 1,
      });

      setFeaturedPosts([...featuredPosts, { ...post, is_featured: true }]);
      setAvailablePosts(availablePosts.filter((p) => p.id !== post.id));
    } catch (error) {
      console.error('Failed to feature post:', error);
      alert('Failed to feature post');
    }
  };

  const removeFromFeatured = async (post: Post) => {
    try {
      await axios.patch(`/api/posts/${post.id}`, {
        is_featured: false,
        featured_order: 0,
      });

      setFeaturedPosts(featuredPosts.filter((p) => p.id !== post.id));
      setAvailablePosts([{ ...post, is_featured: false }, ...availablePosts]);
    } catch (error) {
      console.error('Failed to unfeature post:', error);
      alert('Failed to unfeature post');
    }
  };

  const filteredAvailablePosts = availablePosts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Featured Posts Manager</h1>
        <p className="text-gray-600 mt-1">Drag and drop to reorder featured posts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Posts */}
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Featured Posts ({featuredPosts.length})
              </h2>
              <span className="text-sm text-gray-500">
                Drag to reorder
              </span>
            </div>

            {featuredPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <p>No featured posts yet</p>
                <p className="text-sm mt-1">Add posts from the list on the right</p>
              </div>
            ) : (
              <div className="space-y-2">
                {featuredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 border-2 border-gray-200 rounded-lg cursor-move hover:border-blue-500 transition ${
                      draggingIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 text-gray-400 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      </div>

                      {/* Order Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>

                      {/* Featured Image */}
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        {post.category && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 text-xs rounded"
                            style={{
                              backgroundColor: `${post.category.color}20`,
                              color: post.category.color,
                            }}
                          >
                            {post.category.name}
                          </span>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>{post.views_count} views</span>
                          <span>{post.likes_count} likes</span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromFeatured(post)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Remove from featured"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Posts */}
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Available Posts
              </h2>
              
              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredAvailablePosts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No posts found</p>
                </div>
              ) : (
                filteredAvailablePosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                  >
                    <div className="flex items-start gap-3">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {post.title}
                        </h3>
                        {post.category && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 text-xs rounded"
                            style={{
                              backgroundColor: `${post.category.color}20`,
                              color: post.category.color,
                            }}
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToFeatured(post)}
                        className="flex-shrink-0 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Feature
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}