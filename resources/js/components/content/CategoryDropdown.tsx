import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  parent_id?: number;
  children?: Category[];
  posts_count?: number;
}

interface CategoryDropdownProps {
  value: number | null;
  onChange: (categoryId: number | null) => void;
  placeholder?: string;
  showHierarchy?: boolean;
  showIcons?: boolean;
  showCounts?: boolean;
  allowNull?: boolean;
  excludeIds?: number[];
}

export default function CategoryDropdown({
  value,
  onChange,
  placeholder = 'Select a category',
  showHierarchy = true,
  showIcons = true,
  showCounts = false,
  allowNull = true,
  excludeIds = [],
}: CategoryDropdownProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/categories', {
        params: {
          with_children: showHierarchy,
          with_posts_count: showCounts,
        },
      });
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const findCategory = (id: number, cats: Category[] = categories): Category | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategory(id, cat.children);
        if (found) return found;
      }
    }
    return null;
  };

  const renderCategoryOption = (category: Category, level: number = 0) => {
    if (excludeIds.includes(category.id)) return null;

    return (
      <React.Fragment key={category.id}>
        <button
          type="button"
          onClick={() => {
            onChange(category.id);
            setIsOpen(false);
          }}
          className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 ${
            value === category.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
          }`}
          style={{ paddingLeft: `${16 + level * 24}px` }}
        >
          {/* Hierarchy Indicator */}
          {level > 0 && (
            <span className="text-gray-400 dark:text-gray-500">
              {'└'.repeat(level)}
            </span>
          )}

          {/* Icon */}
          {showIcons && category.icon && <span className="text-base">{category.icon}</span>}

          {/* Color Badge */}
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />

          {/* Name — FIXED: explicit text color */}
          <span className="flex-1 truncate text-gray-900 dark:text-gray-100 font-medium">
            {category.name}
          </span>

          {/* Post Count */}
          {showCounts && category.posts_count !== undefined && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({category.posts_count})
            </span>
          )}

          {/* Selected Checkmark */}
          {value === category.id && (
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Render children recursively */}
        {showHierarchy &&
          category.children?.map((child) =>
            renderCategoryOption(child, level + 1)
          )}
      </React.Fragment>
    );
  };

  const selectedCategory = value ? findCategory(value) : null;

  return (
    <div className="relative">
      {/* Selected Display / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700"
      >
        {loading ? (
          <span className="text-gray-500 dark:text-gray-400">Loading...</span>
        ) : selectedCategory ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {showIcons && selectedCategory.icon && (
              <span className="text-base">{selectedCategory.icon}</span>
            )}
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: selectedCategory.color }}
            />
            {/* FIXED: explicit text color */}
            <span className="truncate text-gray-900 dark:text-gray-100 font-medium">
              {selectedCategory.name}
            </span>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        )}

        <svg
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {/* None Option */}
            {allowNull && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  value === null ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <span className="text-gray-500 dark:text-gray-400 italic">{placeholder}</span>
              </button>
            )}

            {/* Separator */}
            {allowNull && categories.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700" />
            )}

            {/* Categories */}
            {categories.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No categories available
              </div>
            ) : (
              categories.map((category) => renderCategoryOption(category))
            )}
          </div>
        </>
      )}
    </div>
  );
}