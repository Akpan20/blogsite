import apiClient from '@/src/lib/apiClient';

export interface PageViewData {
  createdAt: Date;
  _count: { id: number };
}

export interface EngagementMetric {
  type: string;
  _count: { id: number };
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalPageViews: number;
}

export const analyticService = {
  async getPageViews(): Promise<PageViewData[]> {
    const { data } = await apiClient.get<PageViewData[]>('/analytics/page-views');
    return data;
  },

  async getEngagementMetrics(): Promise<{ 
    engagement: EngagementMetric[],
    engagementRate: number 
  }> {
    const { data } = await apiClient.get('/analytics/engagement');
    return data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>('/analytics/stats');
    return data;
  },

  async recordPageView(pageViewData: {
    url: string;
    postId?: string;
    sessionId: string;
    duration: number;
    referrer?: string;
  }) {
    const { data } = await apiClient.post('/analytics/pageview', pageViewData);
    return data;
  }
};