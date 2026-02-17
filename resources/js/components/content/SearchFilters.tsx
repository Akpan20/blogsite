import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryDropdown from './CategoryDropdown';

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  showAdvanced?: boolean;
}

export interface SearchFilters {
  query: string;
  categoryId: number | null;
  tagIds: number[];
  sortBy: 'relevance' | 'date' | 'views' | 'likes';
  sortOrder: 'asc' | 'desc';
  dateFrom: string;
  dateTo: string;
  authorId: number | null;
  readingTimeMin: number | null;
  readingTimeMax: number | null;
}

export default function SearchFilters({
  onSearch,
  initialFilters,
  showAdvanced = true,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categoryId: null,
    tagIds: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
    dateFrom: '',
    dateTo: '',
    authorId: null,
    readingTimeMin: null,
    readingTimeMax: null,
    ...initialFilters,
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.query) count++;
    if (filters.categoryId) count++;
    if (filters.tagIds.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.authorId) count++;
    if (filters.readingTimeMin || filters.readingTimeMax) count++;
    setActiveFilterCount(count);
  }, [filters]);

  useEffect(() => {
    if (tagSearch.length >= 2) {
      fetchTagSuggestions(tagSearch);
    } else {
      setTagSuggestions([]);
    }
  }, [tagSearch]);

  const fetchTagSuggestions = async (query: string) => {
    try {
      const { data } = await axios.get('/api/tags/suggestions', {
        params: { query },
      });
      setTagSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch tag suggestions:', error);
    }
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      categoryId: null,
      tagIds: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
      dateFrom: '',
      dateTo: '',
      authorId: null,
      readingTimeMin: null,
      readingTimeMax: null,
    };
    setFilters(resetFilters);
    setSelectedTags([]);
    onSearch(resetFilters);
  };

  const addTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      updateFilter('tagIds', newTags.map((t) => t.id));
      setTagSearch('');
      setTagSuggestions([]);
    }
  };

  const removeTag = (tagId: number) => {
    const newTags = selectedTags.filter((t) => t.id !== tagId);
    setSelectedTags(newTags);
    updateFilter('tagIds', newTags.map((t) => t.id));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Main Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search posts..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
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

        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Search
        </button>

        {showAdvanced && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            updateFilter('sortBy', 'date');
            handleSearch();
          }}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.sortBy === 'date'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => {
            updateFilter('sortBy', 'views');
            handleSearch();
          }}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.sortBy === 'views'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => {
            updateFilter('sortBy', 'likes');
            handleSearch();
          }}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.sortBy === 'likes'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Most Liked
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <CategoryDropdown
              value={filters.categoryId}
              onChange={(id) => updateFilter('categoryId', id)}
              showHierarchy
              showIcons
              allowNull
            />
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    #{tag.name}
                    <button onClick={() => removeTag(tag.id)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Search */}
            <div className="relative">
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Tag Suggestions */}
              {tagSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      style={{ color: tag.color }}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reading Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reading Time (minutes)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={filters.readingTimeMin || ''}
                onChange={(e) =>
                  updateFilter('readingTimeMin', e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="Min"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={filters.readingTimeMax || ''}
                onChange={(e) =>
                  updateFilter('readingTimeMax', e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="Max"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilter('sortBy', e.target.value as SearchFilters['sortBy'])
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="views">Views</option>
                <option value="likes">Likes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  updateFilter('sortOrder', e.target.value as 'asc' | 'desc')
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="text-sm text-gray-600">
          {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          <button
            onClick={handleReset}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}