import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Earnings {
  total_earnings: number;
  monthly_earnings: number;
  recent_payments: any[];
}

export function useEarnings() {
  const [data, setData] = useState<Earnings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/user/earnings')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to fetch earnings:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}