import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  paystack_plan_code: string | null;
  features: string[];
  max_premium_posts: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: number;
  user_id: number;
  subscription_id: number | null;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  reference: string;
  paid_at: string | null;
  created_at: string;
}

// Get current user's subscription
export function useSubscription() {
  return useQuery<Subscription | null>({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      try {
        const response = await api.get('/subscription/current');
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // No active subscription
        }
        throw error;
      }
    },
  });
}

// Get all available subscription plans
export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription', 'plans'],
    queryFn: async () => {
      const response = await api.get('/subscription/plans');
      return response.data;
    },
  });
}

// Get subscription history
export function useSubscriptionHistory() {
  return useQuery<Subscription[]>({
    queryKey: ['subscription', 'history'],
    queryFn: async () => {
      const response = await api.get('/subscription/history');
      return response.data;
    },
  });
}

// Get payment transactions
export function usePaymentTransactions() {
  return useQuery<PaymentTransaction[]>({
    queryKey: ['subscription', 'transactions'],
    queryFn: async () => {
      const response = await api.get('/subscription/transactions');
      return response.data;
    },
  });
}

// Subscribe to a plan
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: number) => {
      const response = await api.post('/subscription/subscribe', { plan_id: planId });
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    },
  });
}

// Verify payment
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string) => {
      const response = await api.post('/subscription/verify', { reference });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription activated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Payment verification failed');
    },
  });
}

// Cancel subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/subscription/cancel');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    },
  });
}

// Helper hook to check if user has access to premium content
export function useHasPremiumAccess() {
  const { data: subscription } = useSubscription();

  const hasAccess = 
    subscription?.status === 'active' &&
    (subscription?.plan?.slug === 'premium' ||
     subscription?.plan?.slug === 'pro' ||
     subscription?.plan?.slug === 'premium-yearly' ||
     subscription?.plan?.slug === 'pro-yearly' ||
     subscription?.plan?.slug === 'basic-monthly');

  return { hasAccess, subscription };
}