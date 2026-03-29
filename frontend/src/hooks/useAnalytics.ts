import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface OverviewStats {
  total_views: number;
  unique_visitors: number;
  views_this_month: number;
  top_posts: Array<{ id: number; title: string; views_count: number }>;
}

export const useOverview = () => {
  return useQuery<OverviewStats>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/analytics/overview').then(res => res.data),
  });
};

export interface ViewsTrend {
  date: string;
  views: number;
}

export const useViewsOverTime = (days: number = 30) => {
  return useQuery<ViewsTrend[]>({
    queryKey: ['analytics', 'views-over-time', days],
    queryFn: () => api.get('/analytics/views-over-time', { params: { days } }).then(res => res.data),
  });
};