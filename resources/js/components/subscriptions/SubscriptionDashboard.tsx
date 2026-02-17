import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Calendar, TrendingUp, History, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  plan?: { name: string; description: string; billing_period: string };
  amount_paid: string | number;
  starts_at: string;
  expires_at?: string;
  cancelled_at?: string;
  auto_renew?: boolean;
}

interface Transaction {
  id: number | string;
  created_at: string;
  reference: string;
  amount: string | number;
  status: 'success' | 'pending' | 'failed' | 'completed';
}

const SubscriptionDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!user) return; // No need to fetch if not logged in

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [subRes, transRes] = await Promise.all([
          axios.get('/api/subscription/current'),
          axios.get('/api/subscription/transactions'),
        ]);

        setSubscription(subRes.data.subscription || null);
        setTransactions(transRes.data.data || []);
      } catch (err) {
        console.error('Failed to load subscription dashboard:', err);
        setError('Unable to load your subscription details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Re-run when user changes (login/logout)

  const handleCancelSubscription = async () => {
    try {
      await axios.post('/api/subscription/cancel');
      setShowCancelModal(false);
      // Refresh data after cancel
      const subRes = await axios.get('/api/subscription/current');
      setSubscription(subRes.data.subscription || null);
      alert('Subscription cancelled successfully');
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : '—';

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  // ────────────────────────────────────────────────
  // Loading / Auth / Error States
  // ────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="text-lg text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <CreditCard className="w-20 h-20 text-gray-300 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Please log in to view and manage your subscription details.
        </p>
        <a
          href="/login"
          className="bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Log In
        </a>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Main Dashboard Content
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Subscription Dashboard
        </h1>

        {/* Current Subscription */}
        {subscription ? (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-10 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {subscription.plan?.name || 'Active Plan'}
                </h2>
                <p className="text-gray-600 mt-2">{subscription.plan?.description || ''}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                  ₦{Number(subscription.amount_paid).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {subscription.plan?.billing_period || '—'}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-4">
                <Calendar className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Started</p>
                  <p className="font-semibold">{formatDate(subscription.starts_at)}</p>
                </div>
              </div>

              {subscription.expires_at && (
                <div className="flex items-center space-x-4">
                  <Calendar className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="font-semibold">{formatDate(subscription.expires_at)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <TrendingUp className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold">
                    {subscription.cancelled_at ? 'Cancelled' : 'Active'}
                  </p>
                </div>
              </div>
            </div>

            {subscription.auto_renew && !subscription.cancelled_at && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                <p className="text-blue-800">
                  <strong>Auto-renewal is on.</strong> Your plan renews on{' '}
                  {formatDate(subscription.expires_at)}.
                </p>
              </div>
            )}

            {!subscription.cancelled_at ? (
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-red-600 hover:text-red-700 font-medium underline"
              >
                Cancel Subscription
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                <p className="text-yellow-800">
                  Cancelled on {formatDate(subscription.cancelled_at)}. Access continues until{' '}
                  {formatDate(subscription.expires_at)}.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center mb-10">
            <CreditCard className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Active Subscription
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Subscribe to unlock premium features, analytics, and exclusive content.
            </p>
            <a
              href="/subscription/plans"
              className="inline-block bg-blue-600 text-white py-4 px-10 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Explore Plans
            </a>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center mb-6">
            <History className="w-7 h-7 text-gray-400 mr-3" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Transaction History
            </h2>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Reference</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">
                        {tx.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        ₦{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            tx.status
                          )}`}
                        >
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No transactions found yet.
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">
                Cancel Subscription?
              </h3>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure? You'll keep access until the end of your current billing period, but auto-renewal will stop.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-semibold transition"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3.5 rounded-xl font-semibold transition"
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;