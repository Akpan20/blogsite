import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

const AdminRevenueAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/subscription/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor subscription revenue and performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">All Time</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(analytics?.total_revenue || 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">This Month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(analytics?.monthly_revenue || 0)}
            </h3>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {analytics?.active_subscriptions || 0}
            </h3>
            <p className="text-sm text-gray-600">Subscriptions</p>
          </div>

          {/* Average Revenue Per User */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 rounded-lg p-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-600">ARPU</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(
                analytics?.active_subscriptions > 0
                  ? analytics.total_revenue / analytics.active_subscriptions
                  : 0
              )}
            </h3>
            <p className="text-sm text-gray-600">Per Subscriber</p>
          </div>
        </div>

        {/* Subscriptions by Plan */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Subscriptions by Plan</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {analytics?.subscriptions_by_plan?.map((item) => (
                <div key={item.subscription_plan_id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.plan?.name || 'Unknown Plan'}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-blue-600">{item.count}</span>
                    <span className="ml-2 text-gray-600">subscribers</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2"
                      style={{
                        width: `${(item.count / analytics.active_subscriptions) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recent_transactions?.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.user?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {transaction.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      {transaction.subscription?.plan?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-6 font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          transaction.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueAnalytics;