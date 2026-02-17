import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SubscriptionVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (!reference) {
      setStatus('error');
      setError('No payment reference found');
      return;
    }

    verifyPayment(reference);
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    try {
      const response = await axios.post('/api/subscription/verify', { reference });
      
      setSubscription(response.data.subscription);
      setStatus('success');

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setError(error.response?.data?.message || 'Payment verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your subscription has been activated successfully.
            </p>

            {subscription && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">
                  {subscription.plan?.name} Plan
                </h3>
                <p className="text-sm text-green-700">
                  Amount Paid: ₦{parseFloat(subscription.amount_paid).toLocaleString()}
                </p>
                {subscription.expires_at && (
                  <p className="text-sm text-green-700">
                    Valid until: {new Date(subscription.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500">
              Redirecting to dashboard in 3 seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Something went wrong with your payment.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/subscription/plans')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionVerify;