export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  status: 'draft' | 'published';
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  content: string;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  reactions_count: Record<string, number>;
  replies_count: number;
  user_reaction: string | null;
  replies?: Comment[];
}

export interface CommentReaction {
  id: number;
  user_id: number;
  comment_id: number;
  type: ReactionType;
  created_at: string;
  user: User;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠',
};

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  showAdvanced?: boolean;      // Default: true
}

interface TagCloudProps {
  limit?: number;              // Default: 50
  minSize?: number;            // Default: 12px
  maxSize?: number;            // Default: 32px
  showCount?: boolean;         // Default: true
  variant?: 'default' | 'gradient' | 'bubble';
}

interface SearchFilters {
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

interface RelatedPostsProps {
  currentPostId: number;
  limit?: number;              // Default: 3
  variant?: 'grid' | 'list' | 'compact';
  showExcerpt?: boolean;       // Default: true
  showAuthor?: boolean;        // Default: false
  showCategory?: boolean;      // Default: true
  showImage?: boolean;         // Default: true
}

interface CategoryDropdownProps {
  value: number | null;
  onChange: (categoryId: number | null) => void;
  placeholder?: string;
  showHierarchy?: boolean;    // Default: true
  showIcons?: boolean;        // Default: true
  showCounts?: boolean;       // Default: false
  allowNull?: boolean;        // Default: true
  excludeIds?: number[];      // Categories to hide
}

interface SeriesProgressBarProps {
  postId: number;
  seriesId: number;
  variant?: 'default' | 'compact' | 'detailed';
  showNavigation?: boolean;    // Default: true
}

interface SeriesSelectorProps {
  postId: number;
  currentSeries?: Series[];
  onChange?: (series: Series[]) => void;
}

interface SidebarProps {
  variant?: 'default' | 'blog' | 'dashboard';
  sticky?: boolean;
}