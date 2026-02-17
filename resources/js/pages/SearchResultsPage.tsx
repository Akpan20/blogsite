import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/SearchBar';
import SearchFilters, { SearchFilters as Filters } from '@/components/content/SearchFilters';
import { Loader2, Calendar, User, Eye, Tag, BookOpen } from 'lucide-react';
import api from '@/lib/api';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  views_count: number;
  reading_time?: number;
  category?: {
    id: number;
    name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
  }>;
  user: {
    id: number;
    name: string;
  };
}

interface SearchResults {
  query: string;
  total: number;
  results: Post[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build params from URL
        const params: any = {
          query: query,
          page,
          per_page: 10,
        };

        // Add additional filters from URL
        if (searchParams.get('categoryId')) {
          params.categoryId = searchParams.get('categoryId');
        }
        if (searchParams.get('tagIds')) {
          params.tagIds = searchParams.get('tagIds')?.split(',').map(Number);
        }
        if (searchParams.get('sortBy')) {
          params.sortBy = searchParams.get('sortBy');
        }
        if (searchParams.get('sortOrder')) {
          params.sortOrder = searchParams.get('sortOrder');
        }
        if (searchParams.get('dateFrom')) {
          params.dateFrom = searchParams.get('dateFrom');
        }
        if (searchParams.get('dateTo')) {
          params.dateTo = searchParams.get('dateTo');
        }
        if (searchParams.get('readingTimeMin')) {
          params.readingTimeMin = searchParams.get('readingTimeMin');
        }
        if (searchParams.get('readingTimeMax')) {
          params.readingTimeMax = searchParams.get('readingTimeMax');
        }

        const response = await api.get('/search', { params });

        setResults(response.data);
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, page, searchParams]);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery, page: '1' });
  };

  const handleFilterSearch = (filters: Filters) => {
    const params: any = {
      q: filters.query,
      page: '1',
    };

    if (filters.categoryId) params.categoryId = filters.categoryId.toString();
    if (filters.tagIds.length > 0) params.tagIds = filters.tagIds.join(',');
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.readingTimeMin) params.readingTimeMin = filters.readingTimeMin.toString();
    if (filters.readingTimeMax) params.readingTimeMax = filters.readingTimeMax.toString();

    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = Object.fromEntries(searchParams);
    params.page = newPage.toString();
    setSearchParams(params);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchParams.get('categoryId')) count++;
    if (searchParams.get('tagIds')) count += searchParams.get('tagIds')!.split(',').length;
    if (searchParams.get('dateFrom') || searchParams.get('dateTo')) count++;
    if (searchParams.get('readingTimeMin') || searchParams.get('readingTimeMax')) count++;
    return count;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Search bar and filter toggle */}
      <div className="mb-8">
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search articles..."
              showSuggestions={false}
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4">
            <SearchFilters
              onSearch={handleFilterSearch}
              initialFilters={{
                query: query,
                categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null,
                tagIds: searchParams.get('tagIds')?.split(',').map(Number) || [],
                sortBy: (searchParams.get('sortBy') as any) || 'relevance',
                sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
                dateFrom: searchParams.get('dateFrom') || '',
                dateTo: searchParams.get('dateTo') || '',
                authorId: null,
                readingTimeMin: searchParams.get('readingTimeMin') ? Number(searchParams.get('readingTimeMin')) : null,
                readingTimeMax: searchParams.get('readingTimeMax') ? Number(searchParams.get('readingTimeMax')) : null,
              }}
              showAdvanced={true}
            />
          </div>
        )}
      </div>

      {/* Results header */}
      {results && !isLoading && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Search Results for "{results.query}"
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Found {results.total} {results.total === 1 ? 'result' : 'results'}
            </p>
            
            {/* Active filters display */}
            {getActiveFilterCount() > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Filters active:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchParams({ q: query, page: '1' })}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </Card>
      )}

      {/* Results */}
      {results && !isLoading && (
        <>
          {results.results.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                No results found for "{results.query}"
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Try different keywords or adjust your filters
              </p>
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSearchParams({ q: query, page: '1' })}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              {results.results.map((post) => (
                <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                  <Link to={`/posts/${post.slug || post.id}`}>
                    <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt || 'No excerpt available'}
                  </p>

                  {/* Meta information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views_count} views</span>
                    </div>
                    {post.reading_time && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{post.reading_time} min read</span>
                      </div>
                    )}
                    {post.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span className="text-blue-600">{post.category.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {results.pagination.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={results.pagination.current_page === 1}
                onClick={() => handlePageChange(results.pagination.current_page - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: results.pagination.last_page }, (_, i) => i + 1)
                .filter((p) => {
                  const current = results.pagination.current_page;
                  return p === 1 || p === results.pagination.last_page || Math.abs(p - current) <= 2;
                })
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2">...</span>}
                    <Button
                      variant={results.pagination.current_page === p ? 'default' : 'outline'}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </Button>
                  </React.Fragment>
                ))}

              <Button
                variant="outline"
                disabled={results.pagination.current_page === results.pagination.last_page}
                onClick={() => handlePageChange(results.pagination.current_page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;