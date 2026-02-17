import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePaystackPayment } from 'react-paystack';
import { Loader2, CreditCard, Shield } from 'lucide-react';

const PaystackPayment = ({ plan, user, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paystackConfig, setPaystackConfig] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaystackConfig();
  }, []);

  const fetchPaystackConfig = async () => {
    try {
      const response = await axios.get('/api/subscription/paystack-config');
      setPaystackConfig(response.data);
    } catch (error) {
      console.error('Error fetching Paystack config:', error);
      setError('Failed to load payment configuration');
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize subscription
      const response = await axios.post('/api/subscription/subscribe', {
        plan_id: plan.id,
      });

      const { authorization_url, reference } = response.data.data;

      // Redirect to Paystack
      window.location.href = authorization_url;
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error.response?.data?.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  if (!paystackConfig) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Plan Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to {plan.name}</h2>
        <div className="flex items-baseline mb-4">
          <span className="text-4xl font-bold text-gray-900">
            ₦{parseFloat(plan.price).toLocaleString()}
          </span>
          <span className="ml-2 text-gray-600">
            /{plan.billing_period === 'monthly' ? 'month' : plan.billing_period === 'yearly' ? 'year' : 'lifetime'}
          </span>
        </div>
        <p className="text-gray-600">{plan.description}</p>
      </div>

      {/* Features */}
      {plan.features && (
        <div className="mb-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">What's included:</h3>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pay with Paystack</span>
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-6 flex items-center justify-center text-sm text-gray-600">
        <Shield className="w-4 h-4 mr-2" />
        <span>Secure payment powered by Paystack</span>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-4 text-gray-600 py-2 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
      )}

      {/* Terms */}
      <p className="mt-6 text-xs text-gray-500 text-center">
        By subscribing, you agree to our Terms of Service and Privacy Policy. 
        Your subscription will automatically renew unless cancelled.
      </p>
    </div>
  );
};

export default PaystackPayment;