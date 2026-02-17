import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface TagCloudItem {
  id: number;
  name: string;
  slug: string;
  color: string;
  posts_count: number;
  font_size: number;
}

interface TagCloudProps {
  limit?: number;
  minSize?: number;
  maxSize?: number;
  showCount?: boolean;
  variant?: 'default' | 'gradient' | 'bubble';
}

export default function TagCloud({
  limit = 50,
  minSize = 12,
  maxSize = 32,
  showCount = true,
  variant = 'default',
}: TagCloudProps) {
  const [tags, setTags] = useState<TagCloudItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTagCloud();
  }, [limit]);

  const fetchTagCloud = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get('/api/tags/cloud', {
        params: { limit },
      });

      // Early return if no data
      if (!Array.isArray(data) || data.length === 0) {
        setTags([]);
        return;
      }

      // Find min & max once (better performance)
      const counts = data.map(tag => tag.posts_count ?? 0);
      const minCount = Math.min(...counts);
      const maxCount = Math.max(...counts);

      const enrichedTags = data.map(tag => {
        const count = tag.posts_count ?? 0;

        // Avoid division by zero
        const normalized =
          maxCount === minCount ? 0.5 : (count - minCount) / (maxCount - minCount);

        const fontSize = minSize + normalized * (maxSize - minSize);

        return {
          ...tag,
          posts_count: count,
          font_size: Math.round(fontSize),
          // Fallback color if missing from backend
          color: tag.color || '#10B981',
        };
      });

      setTags(enrichedTags);
    } catch (error) {
      console.error('Failed to fetch tag cloud:', error);
      setTags([]); // ← good practice: clear on error
    } finally {
      setLoading(false);
    }
  };

  const getOpacity = (postsCount: number) => {
    if (tags.length === 0) return 1;
    
    const maxCount = Math.max(...tags.map((t) => t.posts_count));
    const minCount = Math.min(...tags.map((t) => t.posts_count));
    
    if (maxCount === minCount) return 1;
    
    return 0.5 + ((postsCount - minCount) / (maxCount - minCount)) * 0.5;
  };

  const renderDefaultTag = (tag: TagCloudItem) => (
    <Link
      key={tag.id}
      to={`/tags/${tag.slug}`}
      className="inline-block hover:underline transition-all duration-200 hover:scale-110"
      style={{
        fontSize: `${tag.font_size}px`,
        color: tag.color,
        opacity: getOpacity(tag.posts_count),
        fontWeight: tag.posts_count > 10 ? 600 : 400,
      }}
      title={`${tag.posts_count} posts`}
    >
      #{tag.name}
      {showCount && (
        <span className="text-xs text-gray-500 ml-1">
          ({tag.posts_count})
        </span>
      )}
    </Link>
  );

  const renderGradientTag = (tag: TagCloudItem) => (
    <Link
      key={tag.id}
      to={`/tags/${tag.slug}`}
      className="inline-flex items-center px-3 py-1 rounded-full hover:shadow-md transition-all duration-200 hover:scale-105"
      style={{
        fontSize: `${Math.max(12, tag.font_size - 8)}px`,
        background: `linear-gradient(135deg, ${tag.color}40, ${tag.color}80)`,
        color: tag.color,
        fontWeight: 500,
      }}
    >
      #{tag.name}
      {showCount && (
        <span
          className="ml-1 px-1.5 py-0.5 rounded-full text-xs"
          style={{
            backgroundColor: `${tag.color}30`,
          }}
        >
          {tag.posts_count}
        </span>
      )}
    </Link>
  );

  const renderBubbleTag = (tag: TagCloudItem) => {
    const size = tag.font_size * 3; // Make bubbles larger
    
    return (
      <Link
        key={tag.id}
        to={`/tags/${tag.slug}`}
        className="inline-flex items-center justify-center rounded-full hover:shadow-lg transition-all duration-300 hover:scale-110"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: `${tag.color}20`,
          border: `2px solid ${tag.color}40`,
          color: tag.color,
          fontSize: `${Math.max(10, tag.font_size - 10)}px`,
          fontWeight: 600,
        }}
        title={`${tag.name} (${tag.posts_count} posts)`}
      >
        <div className="text-center">
          <div>#{tag.name}</div>
          {showCount && (
            <div className="text-xs mt-0.5 opacity-70">
              {tag.posts_count}
            </div>
          )}
        </div>
      </Link>
    );
  };

  const renderTag = (tag: TagCloudItem) => {
    switch (variant) {
      case 'gradient':
        return renderGradientTag(tag);
      case 'bubble':
        return renderBubbleTag(tag);
      default:
        return renderDefaultTag(tag);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tags yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Popular Tags</h3>
        <Link to="/tags" className="text-sm text-blue-600 hover:text-blue-800">
          View all →
        </Link>
      </div>

      <div
        className={`flex flex-wrap ${
          variant === 'bubble' ? 'gap-3 items-center' : 'gap-x-3 gap-y-2 items-baseline'
        }`}
      >
        {tags.map((tag) => renderTag(tag))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
        <span>Showing {tags.length} most popular tags</span>
        <div className="flex items-center gap-2">
          <span>Size indicates popularity</span>
        </div>
      </div>
    </div>
  );
}