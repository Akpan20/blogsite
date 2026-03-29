import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionPlan {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  is_featured?: boolean;
}

interface CurrentSubscription {
  subscription_plan_id: number | string;
  plan?: { name: string };
  expires_at?: string;
  auto_renew?: boolean;
}

const SubscriptionPlans = ({ onSelectPlan }: { onSelectPlan: (plan: SubscriptionPlan) => void }) => {
  const { user, isLoading: authLoading } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch available plans (always public)
        const plansRes = await axios.get('/api/subscription/plans');
        setPlans(plansRes.data);

        // Fetch current subscription only if user is logged in
        if (user) {
          const subRes = await axios.get('/api/subscription/current');
          setCurrentSubscription(subRes.data.subscription || null);
        }
      } catch (err) {
        console.error('Failed to load subscription data:', err);
        setError('Unable to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]); // Re-fetch when user changes (login/logout)

  // Combined loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="ml-4 text-lg text-gray-600">Loading plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Please Log In</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          You need to be logged in to view and select subscription plans.
        </p>
        <a
          href="/login"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Go to Login
        </a>
      </div>
    );
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'pro':
        return <Crown className="w-6 h-6" />;
      case 'premium':
        return <Sparkles className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const isCurrentPlan = (planId: number | string) =>
    currentSubscription?.subscription_plan_id === planId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock premium content, analytics, and more with the right plan for you
          </p>
        </div>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <div className="max-w-2xl mx-auto mb-10 bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-blue-900 text-lg">
                  Current Plan: {currentSubscription.plan?.name || 'Active'}
                </p>
                {currentSubscription.expires_at && (
                  <p className="text-sm text-blue-700 mt-1">
                    Expires on: {new Date(currentSubscription.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {currentSubscription.auto_renew && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Auto-renew active
                </span>
              )}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                plan.is_featured ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              } ${isCurrentPlan(plan.id) ? 'border-4 border-green-500' : 'border border-gray-200'}`}
            >
              {plan.is_featured && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-lg font-semibold text-sm shadow">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div
                className={`p-8 ${
                  plan.is_featured
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  {getPlanIcon(plan.slug) && (
                    <div className={plan.is_featured ? 'text-yellow-300' : 'text-blue-600'}>
                      {getPlanIcon(plan.slug)}
                    </div>
                  )}
                </div>
                <p className={`text-sm ${plan.is_featured ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ₦{Number(plan.price).toLocaleString()}
                  </span>
                  <span className="ml-2 text-gray-600 font-medium">
                    {plan.billing_period === 'monthly'
                      ? '/month'
                      : plan.billing_period === 'yearly'
                      ? '/year'
                      : ' lifetime'}
                  </span>
                </div>
              </div>

              {/* Features & CTA */}
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan(plan.id) ? (
                  <button
                    disabled
                    className="w-full bg-green-600 text-white py-3.5 px-6 rounded-xl font-semibold cursor-not-allowed opacity-80"
                  >
                    Current Plan
                  </button>
                ) : Number(plan.price) === 0 ? (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-700 py-3.5 px-6 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Free Plan
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-colors ${
                      plan.is_featured
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    Subscribe Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes — cancel at any time. You keep access until the end of your current billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We support cards, bank transfers, and mobile money via Paystack.',
              },
              {
                q: 'Can I upgrade or downgrade?',
                a: 'Yes, plan changes take effect at the start of your next billing cycle.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group"
              >
                <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;