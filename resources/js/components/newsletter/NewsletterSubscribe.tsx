import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

interface NewsletterSubscribeProps {
  source?: string;
  variant?: 'default' | 'sidebar' | 'footer' | 'popup';
  className?: string;
}

const NewsletterSubscribe: React.FC<NewsletterSubscribeProps> = ({
  source = 'footer',
  variant = 'default',
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    try {
      setStatus('loading');
      setMessage('');

      const response = await api.post('/newsletter/subscribe', {
        email,
        source,
      });

      setStatus('success');
      setMessage(response.data.message || 'Please check your email to confirm subscription.');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.message ||
        'Failed to subscribe. Please try again.'
      );
    }
  };

  // Compact variant for sidebar
  if (variant === 'sidebar') {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Newsletter</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Get the latest articles delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            disabled={status === 'loading' || status === 'success'}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === 'success' ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Subscribed!
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>
        {message && (
          <p
            className={`text-xs mt-2 ${
              status === 'error' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {status === 'error' && <AlertCircle className="inline h-3 w-3 mr-1" />}
            {status === 'success' && <Check className="inline h-3 w-3 mr-1" />}
            {message}
          </p>
        )}
      </Card>
    );
  }

  // Full variant for footer or dedicated sections
  return (
    <Card className={`p-8 ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h2>
        <p className="text-gray-600 mb-6">
          Get the latest articles, insights, and updates delivered directly to your inbox.
          No spam, unsubscribe anytime.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1"
            disabled={status === 'loading' || status === 'success'}
          />
          <Button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="min-w-35"
          >
            {status === 'loading' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : status === 'success' ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Done!
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              status === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {status === 'error' && <AlertCircle className="h-5 w-5" />}
              {status === 'success' && <Check className="h-5 w-5" />}
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </Card>
  );
};

export default NewsletterSubscribe;