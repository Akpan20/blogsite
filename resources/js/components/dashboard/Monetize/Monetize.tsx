import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Crown, Sparkles, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  is_active: boolean;
  is_featured: boolean;
}

interface UserSubscription {
  id: number;
  subscription_plan_id: number;
  payment_status: string;
  starts_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  auto_renew: boolean;
  amount_paid: number;
  plan: SubscriptionPlan;
}

interface Analytics {
  total_revenue: number;
  monthly_revenue: number;
  active_subscriptions: number;
}

export default function Monetize() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/subscription/plans');
        setPlans(response.data);
      } catch (err: any) {
        toast.error('Failed to load subscription plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      if (!user) { setLoadingSubscription(false); return; }
      try {
        const response = await api.get('/subscription/current');
        setCurrentSubscription(response.data.subscription);
      } catch (err: any) {
        console.error('Subscription fetch error:', err);
      } finally {
        setLoadingSubscription(false);
      }
    };
    fetchCurrentSubscription();
  }, [user]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) { setLoadingAnalytics(false); return; }
      try {
        const response = await api.get('/admin/subscription/analytics');
        setAnalytics(response.data);
      } catch (err: any) {
        // Non-admin users will get 403
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  const handleSubscribe = async (planId: number) => {
    if (!user) { toast.error('Please log in to subscribe'); return; }
    setLoadingPlan(planId);
    try {
      const response = await api.post('/subscription/subscribe', { plan_id: planId });
      if (response.data.data?.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start subscription');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    if (!confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.")) return;
    try {
      await api.post('/subscription/cancel');
      toast.success('Subscription cancelled successfully');
      const response = await api.get('/subscription/current');
      setCurrentSubscription(response.data.subscription);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const formatCurrency = (amount: number) => `₦${parseFloat(amount.toString()).toLocaleString()}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'pro': return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'premium':
      case 'premium-yearly': return <Sparkles className="w-6 h-6 text-blue-500" />;
      default: return null;
    }
  };

  const isCurrentPlan = (planId: number) => currentSubscription?.subscription_plan_id === planId;

  if (loadingPlans) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Monetize Your Content</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose a plan to unlock premium features and start earning</p>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="space-y-8 pb-12">

        {/* Current Subscription Card */}
        {!loadingSubscription && currentSubscription && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900 dark:text-blue-100">{currentSubscription.plan?.name} Plan</CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">{currentSubscription.plan?.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(currentSubscription.amount_paid)}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">{currentSubscription.plan?.billing_period}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Started</div>
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">{formatDate(currentSubscription.starts_at)}</div>
                  </div>
                </div>
                {currentSubscription.expires_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-blue-700 dark:text-blue-300">Expires</div>
                      <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">{formatDate(currentSubscription.expires_at)}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Status</div>
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {currentSubscription.cancelled_at ? 'Cancelled' : 'Active'}
                    </div>
                  </div>
                </div>
              </div>
              {currentSubscription.auto_renew && !currentSubscription.cancelled_at && (
                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Auto-renewal enabled.</strong> Your subscription will automatically renew.
                  </p>
                </div>
              )}
            </CardContent>
            {!currentSubscription.cancelled_at && (
              <CardFooter>
                <Button variant="destructive" onClick={handleCancelSubscription} className="w-full">
                  Cancel Subscription
                </Button>
              </CardFooter>
            )}
          </Card>
        )}

        {/* Subscription Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {currentSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.is_featured ? 'border-2 border-blue-600 shadow-xl' : ''} ${isCurrentPlan(plan.id) ? 'border-4 border-green-500' : ''}`}
              >
                {plan.is_featured && (
                  <div className="absolute -top-3 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan(plan.id) && (
                  <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Current Plan
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {getPlanIcon(plan.slug)}
                  </div>
                  <CardDescription className="text-3xl font-bold mt-2">
                    {formatCurrency(plan.price)}
                    <span className="text-lg font-normal">
                      /{plan.billing_period === 'monthly' ? 'mo' : plan.billing_period === 'yearly' ? 'yr' : 'lifetime'}
                    </span>
                  </CardDescription>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan(plan.id) ? (
                    <Button disabled className="w-full" variant="outline">Current Plan</Button>
                  ) : plan.price === 0 ? (
                    <Button disabled className="w-full" variant="outline">Free Plan</Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loadingPlan === plan.id || !user}
                    >
                      {loadingPlan === plan.id ? 'Redirecting...' : user ? 'Subscribe Now' : 'Sign In to Subscribe'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Admin Analytics */}
        {!loadingAnalytics && analytics && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Revenue Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.total_revenue)}</div>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.monthly_revenue)}</div>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.active_subscriptions}</div>
                  <p className="text-xs text-gray-500 mt-1">Current subscribers</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}