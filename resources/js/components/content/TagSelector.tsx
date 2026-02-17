import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export default function TagSelector({
  selectedTags,
  onChange,
  maxTags = 10,
  placeholder = 'Add tags...',
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    try {
      const { data } = await axios.get('/api/tags/suggestions', {
        params: { query },
      });

      // Filter out already selected tags
      const filtered = data.filter(
        (tag: Tag) => !selectedTags.some((selected) => selected.id === tag.id)
      );

      setSuggestions(filtered);
      setShowSuggestions(true);
      setHighlightedIndex(0);
    } catch (error) {
      console.error('Failed to fetch tag suggestions:', error);
    }
  };

  const addTag = (tag: Tag) => {
    if (selectedTags.length >= maxTags) {
      alert(`Maximum ${maxTags} tags allowed`);
      return;
    }

    if (!selectedTags.some((t) => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagId: number) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (showSuggestions && suggestions.length > 0) {
        // Select highlighted suggestion
        addTag(suggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        // Create new tag
        createNewTag(inputValue.trim());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag on backspace when input is empty
      removeTag(selectedTags[selectedTags.length - 1].id);
    } else if (e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        createNewTag(inputValue.trim());
      }
    }
  };

  const createNewTag = async (name: string) => {
    try {
      const { data } = await axios.post('/api/tags', { name });
      addTag(data);
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert('Failed to create tag');
    }
  };

  return (
    <div className="w-full">
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              border: `1px solid ${tag.color}40`,
            }}
          >
            #{tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="hover:opacity-70"
            >
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

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={
            selectedTags.length >= maxTags
              ? `Maximum ${maxTags} tags reached`
              : placeholder
          }
          disabled={selectedTags.length >= maxTags}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />

        {/* Tag Counter */}
        <div className="absolute right-3 top-2 text-xs text-gray-500">
          {selectedTags.length}/{maxTags}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((tag, index) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition ${
                  index === highlightedIndex ? 'bg-blue-50' : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: tag.color }}>
                    #{tag.name}
                  </span>
                  {tag.posts_count !== undefined && (
                    <span className="text-xs text-gray-500">
                      {tag.posts_count} posts
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create New Tag Hint */}
        {inputValue.trim() && !showSuggestions && (
          <div className="mt-1 text-xs text-gray-500">
            Press Enter or comma to create "{inputValue}" as a new tag
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500">
        Type to search or create tags. Press Enter or comma to add. Backspace to remove.
      </div>
    </div>
  );
}