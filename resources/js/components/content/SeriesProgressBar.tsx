import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
}

interface Series {
  id: number;
  title: string;
  slug: string;
  description?: string;
}

interface Progress {
  current: number;
  total: number;
  percentage: number;
}

interface SeriesProgressBarProps {
  postId: number;
  seriesId: number;
  variant?: 'default' | 'compact' | 'detailed';
  showNavigation?: boolean;
}

export default function SeriesProgressBar({
  postId,
  seriesId,
  variant = 'default',
  showNavigation = true,
}: SeriesProgressBarProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [nextPost, setNextPost] = useState<Post | null>(null);
  const [previousPost, setPreviousPost] = useState<Post | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
    fetchSeries();
  }, [postId, seriesId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/series/${seriesId}/posts/${postId}/progress`
      );
      
      setProgress(data.progress);
      setNextPost(data.next_post);
      setPreviousPost(data.previous_post);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const { data } = await axios.get(`/api/series/${seriesId}`);
      setSeries(data);
    } catch (error) {
      console.error('Failed to fetch series:', error);
    }
  };

  if (loading || !progress || !series) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4 h-24" />
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
          {progress.current}/{progress.total}
        </span>
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        {/* Series Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">
                Part of Series
              </div>
              <Link
                to={`/series/${series.slug}`}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition"
              >
                {series.title}
              </Link>
              {series.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {series.description}
                </p>
              )}
            </div>
            
            <Link
              to={`/series/${series.slug}`}
              className="ml-4 px-3 py-1 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
            >
              View Series
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Part {progress.current} of {progress.total}
            </span>
            <span className="text-sm font-bold text-blue-600">
              {progress.percentage}% Complete
            </span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        {showNavigation && (previousPost || nextPost) && (
          <div className="grid grid-cols-2 gap-4">
            {/* Previous Post */}
            <div>
              {previousPost ? (
                <Link
                  to={`/posts/${previousPost.slug}`}
                  className="block p-4 bg-white rounded-lg hover:shadow-md transition group"
                >
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </div>
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
                    {previousPost.title}
                  </div>
                </Link>
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg opacity-50">
                  <div className="text-xs text-gray-500 mb-1">Previous</div>
                  <div className="text-sm text-gray-400">First in series</div>
                </div>
              )}
            </div>

            {/* Next Post */}
            <div>
              {nextPost ? (
                <Link
                  to={`/posts/${nextPost.slug}`}
                  className="block p-4 bg-white rounded-lg hover:shadow-md transition group"
                >
                  <div className="text-xs text-gray-500 mb-1 flex items-center justify-end gap-1">
                    Next
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 text-right">
                    {nextPost.title}
                  </div>
                </Link>
              ) : (
                <div className="p-4 bg-gray-100 rounded-lg opacity-50">
                  <div className="text-xs text-gray-500 mb-1 text-right">Next</div>
                  <div className="text-sm text-gray-400 text-right">Last in series</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <div>
            <div className="text-xs text-blue-600 font-medium">Part of</div>
            <Link
              to={`/series/${series.slug}`}
              className="font-semibold text-blue-900 hover:text-blue-700 transition"
            >
              {series.title}
            </Link>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-blue-600">Progress</div>
          <div className="text-lg font-bold text-blue-900">
            {progress.current}/{progress.total}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Navigation */}
      {showNavigation && (previousPost || nextPost) && (
        <div className="flex justify-between gap-2">
          {previousPost ? (
            <Link
              to={`/posts/${previousPost.slug}`}
              className="flex-1 px-3 py-2 bg-white text-blue-900 rounded text-sm font-medium hover:bg-blue-100 transition truncate"
            >
              ← Previous
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextPost && (
            <Link
              to={`/posts/${nextPost.slug}`}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition truncate text-right"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}