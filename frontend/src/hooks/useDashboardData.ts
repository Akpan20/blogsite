import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pageViews, engagement, stats] = await Promise.all([
          api.get('/analytics/page-views'),
          api.get('/analytics/engagement'),
          api.get('/analytics/stats')
        ]);

        setData({
          pageViews: pageViews.data,
          engagement: engagement.data,
          stats: stats.data
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading };
}