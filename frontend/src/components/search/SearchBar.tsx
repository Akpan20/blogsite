import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestion {
  id: number;
  title: string;
  slug: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search articles...',
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!showSuggestions || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/search/suggestions', {
          params: { q: query, limit: 5 },
        });
        setSuggestions(response.data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, showSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(`/content/${suggestion.slug}`);
    setQuery('');
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{suggestion.title}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};